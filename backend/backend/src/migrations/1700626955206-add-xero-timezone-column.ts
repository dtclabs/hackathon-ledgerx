import { MigrationInterface, QueryRunner } from 'typeorm'

const timezones = [
  { name: 'Belarus Standard Time', offset: 3, abbr: 'BST' },
  { name: 'Line Islands Standard Time', offset: 14, abbr: 'LIT' }
]

const SPECIFIC_XERO_TIMEZONE_MAP = {
  DATELINESTANDARDTIME: 'Dateline Standard Time',
  UTC11: 'UTC-11',
  HAWAIIANSTANDARDTIME: 'Hawaiian Standard Time',
  PACIFICSTANDARDTIME: 'Pacific Standard Time',
  ALASKANSTANDARDTIME: 'Alaskan Standard Time',
  'PACIFICSTANDARDTIME(MEXICO)': 'Pacific Standard Time (Mexico)',
  USMOUNTAINSTANDARDTIME: 'US Mountain Standard Time',
  'MOUNTAINSTANDARDTIME(MEXICO)': 'Mountain Standard Time (Mexico)',
  MOUNTAINSTANDARDTIME: 'Mountain Standard Time',
  CANADACENTRALSTANDARDTIME: 'Canada Central Standard Time',
  CENTRALAMERICASTANDARDTIME: 'Central America Standard Time',
  USEASTERNSTANDARDTIME: 'US Eastern Standard Time',
  CENTRALSTANDARDTIME: 'Central Standard Time',
  'CENTRALSTANDARDTIME(MEXICO)': 'Central Standard Time (Mexico)',
  SAPACIFICSTANDARDTIME: 'SA Pacific Standard Time',
  EASTERNSTANDARDTIME: 'Eastern Standard Time',
  VENEZUELASTANDARDTIME: 'Venezuela Standard Time',
  SAWESTERNSTANDARDTIME: 'SA Western Standard Time',
  PARAGUAYSTANDARDTIME: 'Paraguay Standard Time',
  CENTRALBRAZILIANSTANDARDTIME: 'Central Brazilian Standard Time',
  PACIFICSASTANDARDTIME: 'Pacific SA Standard Time',
  ESOUTHAMERICASTANDARDTIME: 'E. South America Standard Time',
  ATLANTICSTANDARDTIME: 'Atlantic Standard Time',
  ARGENTINASTANDARDTIME: 'Argentina Standard Time',
  SAEASTERNSTANDARDTIME: 'SA Eastern Standard Time',
  GREENLANDSTANDARDTIME: 'Greenland Standard Time',
  MONTEVIDEOSTANDARDTIME: 'Montevideo Standard Time',
  BAHIASTANDARDTIME: 'Bahia Standard Time',
  NEWFOUNDLANDSTANDARDTIME: 'Newfoundland Standard Time',
  UTC02: 'UTC-02',
  CAPEVERDESTANDARDTIME: 'Cape Verde Standard Time',
  MIDATLANTICSTANDARDTIME: 'Mid-Atlantic Standard Time',
  UTC: 'UTC',
  AZORESSTANDARDTIME: 'Azores Standard Time',
  GMTSTANDARDTIME: 'GMT Standard Time',
  GREENWICHSTANDARDTIME: 'Greenwich Standard Time',
  MOROCCOSTANDARDTIME: 'Morocco Standard Time',
  WCENTRALAFRICASTANDARDTIME: 'W. Central Africa Standard Time',
  NAMIBIASTANDARDTIME: 'Namibia Standard Time',
  SOUTHAFRICASTANDARDTIME: 'South Africa Standard Time',
  WEUROPESTANDARDTIME: 'W. Europe Standard Time',
  CENTRALEUROPESTANDARDTIME: 'Central Europe Standard Time',
  ROMANCESTANDARDTIME: 'Romance Standard Time',
  CENTRALEUROPEANSTANDARDTIME: 'Central European Standard Time',
  LIBYASTANDARDTIME: 'Libya Standard Time',
  EGYPTSTANDARDTIME: 'Egypt Standard Time',
  TURKEYSTANDARDTIME: 'Turkey Standard Time',
  GTBSTANDARDTIME: 'GTB Standard Time',
  MIDDLEEASTSTANDARDTIME: 'Middle East Standard Time',
  SYRIASTANDARDTIME: 'Syria Standard Time',
  EEUROPESTANDARDTIME: 'E. Europe Standard Time',
  FLESTANDARDTIME: 'FLE Standard Time',
  ISRAELSTANDARDTIME: 'Israel Standard Time',
  JORDANSTANDARDTIME: 'Jordan Standard Time',
  ARABICSTANDARDTIME: 'Arabic Standard Time',
  KALININGRADSTANDARDTIME: 'Kaliningrad Standard Time',
  ARABSTANDARDTIME: 'Arab Standard Time',
  EAFRICASTANDARDTIME: 'E. Africa Standard Time',
  BELARUSSTANDARDTIME: 'Belarus Standard Time',
  CAUCASUSSTANDARDTIME: 'Caucasus Standard Time',
  MAURITIUSSTANDARDTIME: 'Mauritius Standard Time',
  GEORGIANSTANDARDTIME: 'Georgian Standard Time',
  ARABIANSTANDARDTIME: 'Arabian Standard Time',
  IRANSTANDARDTIME: 'Iran Standard Time',
  AFGHANISTANSTANDARDTIME: 'Afghanistan Standard Time',
  WESTASIASTANDARDTIME: 'West Asia Standard Time',
  PAKISTANSTANDARDTIME: 'Pakistan Standard Time',
  AZERBAIJANSTANDARDTIME: 'Azerbaijan Standard Time',
  INDIASTANDARDTIME: 'India Standard Time',
  SRILANKASTANDARDTIME: 'Sri Lanka Standard Time',
  NEPALSTANDARDTIME: 'Nepal Standard Time',
  BANGLADESHSTANDARDTIME: 'Bangladesh Standard Time',
  CENTRALASIASTANDARDTIME: 'Central Asia Standard Time',
  MYANMARSTANDARDTIME: 'Myanmar Standard Time',
  SEASIASTANDARDTIME: 'SE Asia Standard Time',
  NCENTRALASIASTANDARDTIME: 'N. Central Asia Standard Time',
  TAIPEISTANDARDTIME: 'Taipei Standard Time',
  ULAANBAATARSTANDARDTIME: 'Ulaanbaatar Standard Time',
  NORTHASIAEASTSTANDARDTIME: 'North Asia East Standard Time',
  NORTHASIASTANDARDTIME: 'North Asia Standard Time',
  CHINASTANDARDTIME: 'China Standard Time',
  SINGAPORESTANDARDTIME: 'Singapore Standard Time',
  WAUSTRALIASTANDARDTIME: 'W. Australia Standard Time',
  KOREASTANDARDTIME: 'Korea Standard Time',
  YAKUTSKSTANDARDTIME: 'Yakutsk Standard Time',
  CENAUSTRALIASTANDARDTIME: 'Cen. Australia Standard Time',
  AUSCENTRALSTANDARDTIME: 'AUS Central Standard Time',
  TASMANIASTANDARDTIME: 'Tasmania Standard Time',
  AUSEASTERNSTANDARDTIME: 'AUS Eastern Standard Time',
  EAUSTRALIASTANDARDTIME: 'E. Australia Standard Time',
  WESTPACIFICSTANDARDTIME: 'West Pacific Standard Time',
  CENTRALPACIFICSTANDARDTIME: 'Central Pacific Standard Time',
  VLADIVOSTOKSTANDARDTIME: 'Vladivostok Standard Time',
  FIJISTANDARDTIME: 'Fiji Standard Time',
  MAGADANSTANDARDTIME: 'Magadan Standard Time',
  NEWZEALANDSTANDARDTIME: 'New Zealand Standard Time',
  'UTC+12': 'UTC+12',
  SAMOASTANDARDTIME: 'Samoa Standard Time',
  TONGASTANDARDTIME: 'Tonga Standard Time',
  KAMCHATKASTANDARDTIME: 'Kamchatka Standard Time',
  RUSSIANSTANDARDTIME: 'Moscow Standard Time',
  RUSSIATIMEZONE3: 'Samara Time',
  EKATERINBURGSTANDARDTIME: 'Yekaterinburg Time',
  TOKYOSTANDARDTIME: 'Japan Standard Time',
  RUSSIATIMEZONE10: 'Magadan Standard Time',
  LINEISLANDSSTANDARDTIME: 'Line Islands Standard Time'
}

export class addXeroTimezoneColumn1700626955206 implements MigrationInterface {
  name = 'addXeroTimezoneColumn1700626955206'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "timezone" ADD "xero_timezone" character varying`)

    for (const timezone of timezones) {
      await queryRunner.query(
        `INSERT INTO "timezone" (name, abbrev, utc_offset)
         VALUES ('${timezone.name}', '${timezone.abbr}', ${timezone.offset * 60})`
      )
    }

    for (const [xeroTimezone, existedTimezone] of Object.entries(SPECIFIC_XERO_TIMEZONE_MAP)) {
      await queryRunner.query(
        `UPDATE "timezone" 
            SET xero_timezone = '${xeroTimezone}'
            WHERE name = '${existedTimezone}'`
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const timezone of timezones) {
      await queryRunner.query(`DELETE FROM "timezone" WHERE name = '${timezone.name}'`)
    }

    await queryRunner.query(`ALTER TABLE "timezone" DROP COLUMN "xero_timezone"`)
  }
}
