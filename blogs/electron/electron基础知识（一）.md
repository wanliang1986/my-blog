---
title: Electron 基础知识（一)
date: '2023-1-24'
sidebar: 'auto'
categories:
 - Electron
tags:
 - Electron
---

::: tip
   如果你可以建一个网站，你就可以建一个桌面应用程序。Electron是一个使用javaScript,HTML和Css等Web技术创建原生程序的框架，它负责把你的页面部分打包成跨平台的（Windows,Mac,Linux）应用程序，而开发者可以把精力放到应用的核心功能实现即可。
   本篇记录一些基础的运用，帮你打开一个Hello Electron!
:::

<!-- more -->


## 初始化Electron

- 在新建文件夹中通过 npm init 创建package.json文件
- npm i --save-dev electron 或 yarn add --dev electron 注意（node版本需要高于12.20.55）
- 在package.json 文件中添加启动命令
``` js
 "start":"electron ."
```
- 在项目根目录创建package.json中main指向文件index.js

## main指向文件引用electron

在index.js中编写一下代码，控制台中运行npm start,可以打开electron窗口
``` js
const {app,BrowserWindow} = require('electron')

//app 控制主进程的生命周期事件
//BorwserWindow 控制浏览器窗口

//监听初始化完成的生命周期
app.on('ready',()=>{
   const mainWindow = new BrowserWindow({
        width:500,
        height:500
    })
   
   mainWindow.loadFile('src/index.html')
})
//在主进程准备完毕之后，初始化一个宽高为500的窗口，然后通过loadFile方法加载html文件渲染文件内容
```
## 安装electron 热加载工具

``` js
  cnpm install --save-dev electron-reloader
```
安装完成后在入口文件index.js中添加以下代码：

``` js
//热加载
const reloader  = require('electron-reloader')
reloader(module)
```
完成后重新启动项目，此时，在项目文件中做出的任何更改，都会自动更新出最新效果

## 打开页面调试

- ctrl+shift+i命令形式打开页面调试

- 在主进程的ready生命周期里，通过minWindow的webContents方法来打开，此方法只在启动electron时，页面调试控制台会自动打开,关闭后通过ctrl+shift+i可再次打开

``` js
mainWindow.webContents.openDevTools()
```
## electron 常用生命周期
``` js
app.on('ready',function(){ //app加载成功后调用

})
app.whenReady().then(()=>{ //另一种用法

}) 
app.on('browser-window-created',function(){ //页面初始完成

})
app.on('browser-window-focus',function(){ //页面获取焦点
  console.log('browser-window-focus');
})

app.on('browser-window-blur',function(){ //页面失去焦点
  console.log('browser-window-blur');
})

app.on('before-quit',function(){ //退出关闭之前

})
app.on('will-quit',function(){ //关闭所有窗口
  console.log('browser-window-focus');
})

app.on('quit',function(){ //退出app
  console.log('browser-window-blur');
})
```


