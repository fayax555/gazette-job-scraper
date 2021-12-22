import mongoose from 'mongoose'

const listingsSchema = new mongoose.Schema({
  office: String,
  title: String,
  info: String,
  url: String,
  publishedDate: Date,
  attachments: String,
  officeInfoHtml: String,
  retracted: String,
  bodyHtml: String,
})

export default mongoose.models.listingsSchema ||
  mongoose.model('Listing', listingsSchema)
