import dotenv from 'dotenv'
dotenv.config()
import playwright from 'playwright'
import cheerio from 'cheerio'
import {
  getLastPageNum,
  connectToMongoDb,
  dvMonthToNum,
  engMonthToNum,
} from './utils.js'
import Listing from './model/Listing.js'
import mongoose from 'mongoose'

async function scrapeListings(page) {
  const listingsArr = []

  const scrapePage = async (pageNum) => {
    await page.goto(
      `https://www.gazette.gov.mv/iulaan?type=vazeefaa&open-only=1&page=${pageNum}`
    )

    const html = await page.content()
    const $ = cheerio.load(html)

    const listings = $('.items-list .items')
      .map((i, el) => {
        const office = $(el).find('.iulaan-office').text().trim()
        const title = $(el).find('.iulaan-title').text().trim()
        const url = $(el).find('.iulaan-title').attr('href')
        const retracted = $(el).find('.retracted').text().trim()

        return {
          office,
          title,
          url,
          retracted,
        }
      })
      .toArray()

    listingsArr.push(...listings)
  }

  const lastPageNum = await getLastPageNum(page)

  for (let i = 1; i < 4; i++) {
    await scrapePage(i)
  }

  return listingsArr
}

async function scrapeJobDescriptions(listings, page) {
  const updatedListingsArr = []

  for (const listing of listings) {
    await page.goto(listing.url)

    const html = await page.content()
    const $ = cheerio.load(html)

    //remove 'iulaan type'
    $(
      '#iulaan-view > div.col-md-9.iulaan-info.bordered.no-padding.items-list > div:nth-child(1) > div.col-md-3.no-padding'
    ).remove()

    const bodyHtml = $(
      '#iulaan-view > div.col-md-9.iulaan-info.bordered.no-padding.items-list'
    )
      .html()
      .trim()

    const additionalInfo = (number) =>
      $(`#additional-info > div > div:nth-child(${number})`)
        .text()
        .split(': ')[1]
        .trim()

    const number = additionalInfo(1)
    const [day, month, year] = additionalInfo(2).split(' ')
    const [hour, minute] = additionalInfo(3).split(':')

    console.log({ day, month, year, hour, minute })
    console.log((dvMonthToNum[month] || engMonthToNum[month]) - 1)

    const publishedDate = new Date(
      year,
      (dvMonthToNum[month] || engMonthToNum[month]) - 1,
      day,
      hour,
      minute
    )

    console.log(publishedDate)

    const officeInfoHtml = $('.iulaan-info .office-info').html().trim()
    const attachments = $(
      '#additional-info > div:nth-child(1) > div:nth-child(6) > ul'
    )
      .html()
      .trim()

    updatedListingsArr.push({
      ...listing,
      attachments,
      officeInfoHtml,
      bodyHtml,
      number,
      publishedDate,
    })
  }

  return updatedListingsArr
}

async function main() {
  await connectToMongoDb()

  const browser = await playwright.chromium.launch({ headless: true })
  const page = await browser.newPage()
  const listings = await scrapeListings(page)
  const updatedList = await scrapeJobDescriptions(listings, page)

  await Listing.insertMany(updatedList)

  await browser.close()
  await mongoose.connection.close()
}

main()
