const express = require('express');
const app = express();
const axios = require('axios');
const qs = require('qs')
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
      
    let filename = req.body.name;
    const fileType = filename.slice((Math.max(0, filename.lastIndexOf(".")) || Infinity) + 1);
    const fileTitle = filename.substring(0, filename.lastIndexOf('.')) || filename;
    let count = 0;
    const createFileName = async (name) => {
        const match = await db.collection('gridFsEx').findOne({ _id: name });
        if (match) {
            // matching name found
            count ++;
            await createFileName(`${fileTitle} ${count}.${fileType}`);
        } else {
            filename = name;
        }
    }
    
    await createFileName(req.body.name);
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
    const {attachments} = req.body;
    createFile(attachments)

    await db.collection('gridFsEx').insertOne(user);

    res.status(200).send(user);
    // res.sendStatus(200);
  } catch (e) {
    console.log('something terrible has happened:\n')
    console.log(e)
    res.status(e.statusCode || 500).json({success: false, msg: e})
  }
})

app.get('/files/:id', async (req, res) =>{
  try {
    // const data = await bucket.find({ filename: req.params.id }).toArray();
    // if (!data.length) return res.status(404).json({ success: false, msg: 'URL path does not exist'});
    // bucket.openDownloadStreamByName(req.params.id).pipe(res);
    // res.status(201);

    // const data = await bucket.find({ filename: req.params.id }).toArray();
    // const data = bucket.openDownloadStreamByName(req.params.id);
    const fileData = await db.collection('gridFsEx').findOne({ files: [req.params.id] });
    const {_id: filename} = fileData

    const file = bucket.openDownloadStreamByName(req.params.id);

    res.set({
        'Content-Disposition': 'attachment; filename=' + filename
    });

    file.pipe(res);

    // const readStream = db.collection('gridFsEx').createReadStream({ _id: req.params.id });

    // res.status(200).json({success: true, msg: filename})
  } catch (e) {
    console.log(e);
    res.status(500).json({success: false, msg: e})
  }
})

app.get('/tickets', async (req, res) => {
  const accessToken = await axios({
      method: 'post',
      url: 'https://my.pureheart.org/ministryplatformapi/oauth/connect/token',
      data: qs.stringify({
          grant_type: "client_credentials",
          scope: "http://www.thinkministry.com/dataplatform/scopes/all",
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET
      })
  })
      .then(response => response.data.access_token)
      .catch(err => console.error(err))

  const data = await axios({
      method: 'post',
      url: `https://my.pureheart.org/ministryplatformapi/procs/api_Widget_HelpdeskTickets`,
      headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
      }
  })
      .then(response => response.data[0])
      .catch(err => console.error(err))

  res.status(200).send(data).end();
})

module.exports = app;