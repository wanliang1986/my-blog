---
title: Electron 基础知识（三)
date: '2023-1-26'
sidebar: 'auto'
categories:
 - Electron
tags:
 - Electron
---

::: tip
   本篇记录各个窗口及自定义右键的使用!
:::

<!-- more -->

## 窗口区分

- 主窗口 主窗口指打开的最外层窗口，可以存在多个
- 子窗口 子窗口作为主窗口的子级存在，在没有设置属性的情况下，子窗口的操作与主窗口的操作互不影响
- 模态窗口 模态窗口属于子窗口的一种，但是模态窗口出现的时候，其父级主窗口不可操作

在下面的代码中，通过注释可以看出主窗口，子窗口及模态窗口的不同
``` js
app.on('ready', () => {
    //主窗口
    const mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        // frame:false
        // autoHideMenuBar:true,
        title:'test-Electron',
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:false
        }
    })
    

    mainWindow.loadFile('src/index.html')
    mainWindow.webContents.openDevTools()

    const template = [
        {
            label: '文件',
            submenu: [
                { label: '新建窗口',
                  click (){
                    const childrenWindow = new BrowserWindow({
                        parent:mainWindow, //通过parent属性，判断当前窗口属于哪一个子窗口
                        width:300,
                        height:300,
                        modal:true //通过modal属性，将当前子窗口变为模态窗口
                    })
                    childrenWindow.loadFile('src/index.html')
                  }
                }
            ]
        },
        { label: '保存' }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    remote.enable(mainWindow.webContents)
})
```

## 自定义右键菜单

在渲染进程的index.js文件中引入所需的菜单方法，编写右键菜单模板

``` js
const {Menu,MenuItem,getCurrentWindow} = require('@electron/remote')

//定义右键菜单模板
const contextTemplate = [
    {label:'新建文件'},
    {label:'复制'},
    {label:'点击事件',click(){
        console.log('点击事件')
    }}
]

//创建menu
const menu = Menu.buildFromTemplate(contextTemplate)

```

在dom元素加载完后添加鼠标监听事件
``` js
//dom加载完成后监听事件
window.addEventListener('DOMContentLoaded',()=>{
    //鼠标点击监听事件
    window.addEventListener('contextmenu',(e)=>{
        e.preventDefault()
        //通过menu弹出方法，指定鼠标右键菜单在哪个窗口弹出
        menu.popup({window:getCurrentWindow()})
    },false)
})
```


