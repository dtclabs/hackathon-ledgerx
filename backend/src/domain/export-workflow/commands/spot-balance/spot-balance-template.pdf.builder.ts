import { SpotBalanceInterval } from '../../../../shared/entity-services/export-workflows/interface'
import { dateHelper } from '../../../../shared/helpers/date.helper'
import { format } from 'date-fns'

export const pdfHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Inter';
      font-size: 10px;
    }
    .title-font-size {
      font-size: 18px;
    }
    header, .row {
      display: flex;  /* aligns all child elements (flex items) in a row */
    }
    .header-cell {
      border-left: .2px solid;
      border-right: .2px solid;
      border-color: white;
      text-align: center;
      padding-bottom: 0.5rem;
      padding-top: 0.5rem;
    }
    .table-cell {
      border-style: solid;
      border-color: #E2E2E0;
      border-width: .2px;
      padding-bottom: 0.125rem;
      padding-top: 0.125rem;
    }
    .row-date {
      background-color: #E2E2E0;
      color: black;
      font-weight: bold;
    }
    .col {
      flex: 1;        /* distributes space on the line equally among items */
      padding-left: 0.25rem;
      padding-right: 0.25rem;
    }
    </style>
</head>
<body>
<div style="padding-bottom: 2rem">
  <h1 class="title-font-size">%{headerTitle}%</h1>
  <section style="width: 100%">
    <div class="row" style="justify-content: flex-end; align-items: center">
      <div class="col" style="flex: none">Powered by:</div>
      <div class="col" style="flex: none"><img style="max-width: 8rem" src="%{logoPath}%"/></div>
    </div>
  </section>
  <section style="width: 17rem;font-size: 11px">
    <div class="row" style="padding-bottom: 0.3rem">
      <div class="col">Period:</div>
      <div class="col">%{datePeriod}%</div>
    </div>
    <div class="row">
      <span class="col">Generated On:</span>
      <span class="col">%{generatedOn}%</span>
    </div>
  </section>
</div>
<div>
  <section>
    <header style="background-color: #2D2D2C; color: white">
      %{columns}%
    </header>
    %{rows}%
  </section>
</div>
</body>
</html>
`
const tableHeaderColumnTemplate = `<div class="col header-cell" style="%{columnStyte}%">%{columnName}%</div>`
// const tableDateRowTemplate = `<div class="row row-date"><div class="col" style="font-size: 11px; padding-bottom: 0.3rem; padding-top: 0.3rem;">%{rowDate}%</div></div>`
const tableDataRowTemplate = `<div class="row">%{rowData}%</div>`
const tableDataCellTemplate = `<div class="col table-cell" style="%{cellStyle}%">%{cellValue}%</div>`

export class SpotBalancePdfBuilder {
  headerTitle: string
  datePeriod: string
  logoUrl: string

  columns: { width?: string; name: string }[] = []
  rows: string[][]

  constructor() {}

  addTitle(intervalType: SpotBalanceInterval) {
    switch (intervalType) {
      case SpotBalanceInterval.MONTHLY: {
        this.headerTitle = 'MONTH-END CLOSING BALANCE REPORT'
      }
    }
    return this
  }

  addDatePeriod(startDate: Date, endDate: Date) {
    this.datePeriod = `${dateHelper.getMonthYearFromTimestamp(startDate)} - ${dateHelper.getMonthYearFromTimestamp(
      endDate
    )}`
    return this
  }

  addColumns(columns: { width?: string; name: string; decimalPlaces?: number }[]) {
    this.columns = columns
    return this
  }

  addRows(rows: string[][]) {
    this.rows = rows
    return this
  }

  addLogo(logoUrl: string) {
    this.logoUrl = logoUrl
    return this
  }

  build() {
    const rows: string[] = []
    this.rows.forEach((rowData, date) => {
      rows.push(
        tableDataRowTemplate.replace(
          '%{rowData}%',
          rowData
            .map((cellValue, index) => {
              const column = this.columns[index]
              return tableDataCellTemplate
                .replace('%{cellStyle}%', column?.width ? `width: ${column?.width}; flex: none` : '')
                .replace('%{cellValue}%', cellValue)
            })
            .join('')
        )
      )
    })

    return pdfHtmlTemplate
      .replace('%{headerTitle}%', this.headerTitle)
      .replace('%{logo}%', 'Logo_path')
      .replace('%{datePeriod}%', this.datePeriod)
      .replace('%{generatedOn}%', this.formatDateTime(new Date()))
      .replace('%{logoPath}%', this.logoUrl)
      .replace(
        `%{columns}%`,
        this.columns
          .map((column) =>
            tableHeaderColumnTemplate
              .replace('%{columnStyte}%', column.width ? `width: ${column.width}; flex: none` : '')
              .replace('%{columnName}%', column.name)
          )
          .join('')
      )
      .replace(`%{rows}%`, rows.join(''))
  }

  formatDate(date: Date): string {
    const reportDateFormat = 'dd MMM yyyy'
    return format(date, reportDateFormat)
  }

  formatDateTime(date: Date): string {
    const reportDateFormat = 'dd MMM yyyy HH:mm:ss'
    return format(date, reportDateFormat)
  }
}

export class PdfLink {
  constructor(public readonly url: string, public readonly title: string) {}

  toString() {
    return `<a href="${this.url}">${this.title}</a>`
  }
}
