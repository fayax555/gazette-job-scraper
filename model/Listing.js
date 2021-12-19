import mongoose from 'mongoose'

const listingsSchema = new mongoose.Schema({
  office: String,
  title: String,
  info: String,
  url: String,
  publishedTime: String,
  attachments: String,
  officeInfoHtml: String,
  bodyHtml: String,
})

export default mongoose.models.listingsSchema ||
  mongoose.model('Listing', listingsSchema)
