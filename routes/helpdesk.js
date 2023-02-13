const express = require('express');
const app = express();
const fs = require('fs');
const mongodb = require('mongodb');
const client = new mongodb.MongoClient(process.env.MONGO_URI);
const db = client.db('gridFsEx');
const bucket = new mongodb.GridFSBucket(db, { bucketName: 'files' })

const connectDB = async () => {
  await client.connect();
}
connectDB();

//get all user
app.get('/files', async (req, res) => {
  try {
    const users = await db.collection('gridFsEx').find({}).toArray();
    // res.send({success: true, data: users})
    res.send(users)
  } catch (e) {res.status(e.statusCode).json({success: false, msg: e})}
})

//create image
app.post('/files', async (req, res) => {
  try {
    const {body} = req.body;
      
    let filename = body.name;
    let count = 0;
    const createFileName = async (name) => {
        const match = await db.collection('gridFsEx').findOne({ _id: name });
        if (match) {
            // matching name found
            count ++;
            await createFileName(`${body.name} (${count})`);
        } else {
            filename = name;
        }
    }
    
    await createFileName(body.name);
    const user = { _id: filename, files: [] };


    const createFile = file => {
      const fileId = (new mongodb.ObjectId()).toString();
      const fileType = filename.slice((Math.max(0, filename.lastIndexOf(".")) || Infinity) + 1);
      user.files.push(fileId)
      
      const filePath = `./${fileId}.${fileType}`;
      fs.writeFileSync(filePath, file, { encoding: 'base64' });
      fs.createReadStream(filePath).
        pipe(bucket.openUploadStream(fileId, {
          chunkSizeBytes: 10485760
        })).on('finish', () => {
          fs.unlinkSync(filePath)
      })
    }

    // console.log(req.files)
    const {attachments} = body;
    createFile(attachments)

    await db.collection('gridFsEx').insertOne(user);

    res.status(200).send(user);
    // res.sendStatus(200);
  } catch (e) {
    res.status(e.statusCode || 500).json({success: false, msg: e})
  }
})

app.get('/files/:id', async (req, res) =>{
  try {
    const data = await bucket.find({ filename: req.params.id }).toArray();
    if (!data.length) return res.status(404).json({ success: false, msg: 'URL path does not exist'});
    bucket.openDownloadStreamByName(req.params.id).pipe(res);
    res.status(201);
  } catch (e) {
    res.status(500).json({success: false, msg: e})
  }
})

module.exports = app;