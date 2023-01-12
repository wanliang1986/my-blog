module.exports = {
  "title": "RuyWan-blog",
  "description": "my-blog",
  "dest": "public",
  "head": [
    [
      "link",
      {
        "rel": "icon",
        "href": "/favicon.ico"
      }
    ],
    [
      "meta",
      {
        "name": "viewport",
        "content": "width=device-width,initial-scale=1,user-scalable=no"
      }
    ]
  ],
  "theme": "reco",
  "themeConfig": {
    "nav": [
      {
        "text": "Home",
        "link": "/",
        "icon": "reco-home"
      },
      {
        "text": "TimeLine",
        "link": "/timeline/",
        "icon": "reco-date"
      },
      // {
      //   "text": "Docs",
      //   "icon": "reco-message",
      //   "items": [
      //   ]
      // },
      {
        "text": "Contact",
        "icon": "reco-message",
        "items": [
          {
            "text": "GitHub",
            "link": "https://github.com/recoluan",
            "icon": "reco-github"
          }
        ]
      }
    ],
    "sidebar": {
      "/docs/theme-reco/": [
        "",
        "theme",
        "plugin",
        "api"
      ]
    },
    "type": "blog",
    "blogConfig": {
      "category": {
        "location": 2,
        "text": "Category"
      },
      "tag": {
        "location": 3,
        "text": "Tag"
      }
    },
    "friendLink": [
      {
        "title": "vuepress-theme-reco",
        "desc": "A simple and beautiful vuepress Blog & Doc theme.",
        "avatar": "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
        "link": "https://vuepress-theme-reco.recoluan.com"
      }
    ],
    "logo": "/autor.jpeg",
    "search": true,
    "searchMaxSuggestions": 10,
    "lastUpdated": "Last Updated",
    "author": "wanliang",
    "authorAvatar": "/autor.jpeg",
    // "record": "xxxx",
    "startYear": "2022"
  },
  "markdown": {
    "lineNumbers": true
  },
  "plugins": [
    // [
    //   'ribbon',
    //   {
    //     "size": 90, // width of the ribbon, default: 90
    //     "opacity": 0.8, // opacity of the ribbon, default: 0.3
    //     "zIndex": -1, // z-index property of the background, default: -1
    //   },
    // ],
    ['@vuepress-reco/vuepress-plugin-kan-ban-niang', {
      "theme": ["shizuku"],
      "clean": false,
      "info": 'https://github.com/mengqiuleo',
      "messages": {
        "welcome": '',
        "home": '心里的花，我想要带你回家',
        "theme": '好吧，希望你能喜欢我的其他小伙伴。',
        "close": '再见哦'
      }
    }],
    ["sakura", {
      "num": 40,  // 默认数量
      "show": true, //  是否显示
      "zIndex": -1,   // 层级
      "img": {
        "replace": false,  // false 默认图 true 换图 需要填写httpUrl地址
      }
    }]
  ]
}