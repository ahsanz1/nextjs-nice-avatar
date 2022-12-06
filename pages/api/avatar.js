import Avatar, { genConfig } from "react-nice-avatar";
import ReactDOMServer from "react-dom/server";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
const nodeHtmlToImage = require("node-html-to-image");

const firebaseConfig = {
  storageBucket: "nextjs-nice-avatar.appspot.com",
};
const app = initializeApp(firebaseConfig);

export default async function handler(req, res) {
  const storage = getStorage(app);
  const fileName = new Date().getTime().toString();
  const storageRef = ref(storage, `images/${fileName}.png`);
  const reqConfig = req.body || {};

  const config = genConfig(reqConfig);
  const avatar = (
    <Avatar
      style={{ ...reqConfig?.style }}
      {...config}
      shape={reqConfig?.shape}
    />
  );

  const base64Img = await nodeHtmlToImage({
    output: "./image.png",
    html: `<html>
          <head>
            <style>
              body {width: ${reqConfig?.style?.width}; height: ${
      reqConfig?.style?.height
    };}
            </style>
          </head>
          <body>${ReactDOMServer.renderToString(avatar)}</body>
        </html>`,
    quality: 100,
    transparent: true,
    encoding: "base64",
  });
  const snapshot = await uploadString(storageRef, base64Img, "base64");
  const downloadUrl = await getDownloadURL(storageRef);
  res.status(200).json({ downloadUrl });
}
