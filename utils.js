import cheerio from 'cheerio'
import mongoose from 'mongoose'

export const connectToMongoDb = async () => {
  await mongoose.connect(process.env.MONGODB_URI)

  console.log('connected to mongodb')
}

export const getLastPageNum = async (page) => {
  await page.goto(
    'https://www.gazette.gov.mv/iulaan?type=vazeefaa&open-only=1&page=1'
  )

  const html = await page.content()
  const $ = cheerio.load(html)
  const paginationSelector = $('div.col-md-6.left.no-padding .page-item > a')

  return paginationSelector
    .map((i, el) => {
      // length - 2 gives us the last page number
      if (i === paginationSelector.length - 2) return $(el).text()
    })
    .get()[0]
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const dvMonthToNum = {
  ޖަނަވަރީ: 1,
  ފެބުރުވަރީ: 2,
  މާރިޗު: 3,
  އޭޕްރިލް: 4,
  މޭ: 5,
  ޖޫން: 6,
  ޖުލައި: 7,
  އޮގަސްޓް: 8,
  ސެޕްޓެންބަރު: 9,
  އޮކްޓޫބަރު: 10,
  ނޮވެންބަރު: 11,
  ޑިސެންބަރު: 12,
}

export const engMonthToNum = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
}
