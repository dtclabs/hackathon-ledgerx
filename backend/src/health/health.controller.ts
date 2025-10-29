import { HttpService } from '@nestjs/axios'
import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '../shared/logger/logger.service'
import { AxiosRequestConfig } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces'
import { lastValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator
} from '@nestjs/terminus'

class HealthControllerGlobalSettings {
  public static FakeInitialMaxMemGB = 2
  public static UnlimitedMaxMemGB = Number.MAX_SAFE_INTEGER
  public static MaxHeapPercent = 0.8
  public static MaxRSSPercent = 0.9
}

const ECS_META_ENV_NAME = "ECS_CONTAINER_METADATA_URI_V4"
const GB2MB = 1000;
const MB2B = 1024 * 1024;

@Controller('health')
export class HealthController {
  private MaxMemMB;
  constructor(
    private logger: LoggerService,
    private httpService: HttpService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private configService: ConfigService
  ) {
    this.MaxMemMB = HealthControllerGlobalSettings.FakeInitialMaxMemGB * GB2MB // something to fallback to initially in-case we haven't been able to retrieve the actual memory limit from ECS-metadata yet
    this.refreshMaxMemDB()
  }

  @Get()
  @HealthCheck()
  check() {
    const selfCheckURL = new URL('/api/v1/hello', this.configService.get('BASE_URL')).href
    const maxHeap = Math.floor(this.MaxMemMB * HealthControllerGlobalSettings.MaxHeapPercent) * MB2B
    const maxRSS = Math.floor(this.MaxMemMB * HealthControllerGlobalSettings.MaxRSSPercent) * MB2B

    return this.health.check([
      () => this.http.pingCheck(`self_check_${selfCheckURL}`, selfCheckURL),
      async () => this.db.pingCheck('db_access'),
      async () => this.memory.checkHeap(`memory_heap_${maxHeap}`, maxHeap),
      async () => this.memory.checkRSS(`memory_rss_${maxRSS}`, maxRSS),
    ])
  }

  refreshMaxMemDB() {
    var hc = this;
    const ecsMetaURI = process.env[ECS_META_ENV_NAME];
    if (!ecsMetaURI || ecsMetaURI == "") {
      this.logger.info(`unable to retrieve ECS-metadata, undefined or empty env $${ECS_META_ENV_NAME}!`)
      return
    }

    (async () => {
      const config: AxiosRequestConfig = {}
      while (true) {
        try {
          const resp = await lastValueFrom<AxiosResponse>(hc.httpService.get(ecsMetaURI, config))
          const cMeta = resp.data
          if (!cMeta.Limits) {
            hc.logger.info("container has NO cpu/memory limit detected from ECS-metadata")
            hc.MaxMemMB = HealthControllerGlobalSettings.UnlimitedMaxMemGB
            return
          }

          if (!cMeta.Limits.Memory || cMeta.Limits.Memory <= 0) {
            hc.logger.info("container has ONLY cpu limit (NO memory limit) detected from ECS-metadata")
            hc.MaxMemMB = HealthControllerGlobalSettings.UnlimitedMaxMemGB
            return
          }

          hc.MaxMemMB = cMeta.Limits.Memory
          hc.logger.info(`memory limit of container detected from ECS-metadata is ${hc.MaxMemMB} MB`)
          return
        }
        catch (error) {
          hc.logger.error(`failed to retrieve ECS container metadata at ${ecsMetaURI}: ${error}! Retrying after 3 sec...`, error)
          // sleep 3 sec before next retry
          await new Promise(r => setTimeout(r, 3000));
        }
      }
    })()

    this.logger.info(`refreshing memory limit by retrieving ECS-metadata from ${ecsMetaURI}...`)
  }
}
