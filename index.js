let superagent = require('superagent');
superagent = require('superagent-proxy')(superagent);
const fs = require('fs')

const reqHeader = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
  'Cookie': 'bid=aDXDuwA3Fz4; douban-fav-remind=1; ll="118172"; __utmv=30149280.14313; _vwo_uuid_v2=D76696C456A10AC90D85397962FE150BD|02125947083ef73d1e9e38d41f38ffb7; ap_v=0,6.0; __utma=30149280.673563604.1536113998.1546507021.1546582182.13; __utmc=30149280; __utmz=30149280.1546582182.13.12.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; __utmt=1; ps=y; push_noty_num=0; push_doumail_num=0; frodotk="e21a70a65737a0caa64f51f305a6e25e"; __utmb=30149280.16.9.1546583895717',
   'Host': 'm.douban.com',
   'Origin': 'https://www.douban.com',
   'Referer': 'https://www.douban.com/gallery/topic/38033/?sort=new&from=discussing&guest_only=0'
}

let start = 0;
const pageSize = 20;
let total = 5000;
let timer = null;

function init() {
  timer = setInterval(async () => {
    if (start >= total) {
      console.log('---end---')
      clearInterval(timer);
      timer = null;
      return
    } else {
      await getRecord(start)
      start += pageSize;
    }
  }, 1000)
}

// 初始化
async function getRecord(start) {
  const url = `https://m.douban.com/rexxar/api/v2/gallery/topic/38033/items?sort=new&start=${start}&count=${pageSize}&status_full_text=1&guest_only=0&ck=null`
  try {
    const res = await superagent.get(url).set(reqHeader);
    const data = JSON.parse(res.text);
    total = data.total;
    data.items.forEach(i => {
      const { target } = i;
      const { status } = target || {};
      let combineRecord = {}
      if (status) {
        const { author, text, create_time, } = status || {};
        const { avatar, id, name, url  } = author || {};
        combineRecord = {
          id,
          name,
          profileUrl: url,
          avatar,
          time: create_time,
          comment: text
        }
      } else if (target.author) {
        const { name, url, id, avatar, } = target.author;
          combineRecord = {
            id,
            name,
            profileUrl: url,
            avatar,
            time: target.create_time,
            comment: target.abstract
          }
      } 
      let str = JSON.stringify(combineRecord, null, "\t")
      fs.appendFile('./data.json', str, { encoding : 'utf8' }, (e) => {
        e && console.log(e)
      })
    })
  } catch (err) {
    console.log('err=', err)
  }
}

init();




