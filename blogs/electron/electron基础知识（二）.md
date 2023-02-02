---
title: Electron 基础知识（二)
date: '2023-1-25'
sidebar: 'auto'
categories:
 - Electron
tags:
 - Electron
---

::: tip
   本篇记录窗口菜单的使用及如何自定义窗口!
:::

<!-- more -->


## 原生窗口菜单的使用

当你运行初始的electron项目时，会看到有默认的窗口菜单，我们可以通过设置改变默认配置菜单

---

### 修改默认菜单及添加子菜单
我们可以在主进程index.js文件中引入Menu

``` js
const {app,BrowserWindow,Menu} = require('electron')
    
```

然后在ready的生命周期中做如下设定
``` js
const template = [
        {label:'文件'},
        {label:'保存'}
    ]
//编译模板
const menu = Menu.buildFromTemplate(template)
//设置模板
Menu.setApplicationMenu(menu)
```
子菜单的添加同样可以写到template的数组中，同时添加子菜单功能新建窗口。
``` js
const template = [
        {
            label:'文件',
            submenu:[
                {label:'新建窗口',
                 click (){
                    const childrenWindow = new BrowserWindow({
                        width:300,
                        height:300
                    })
                    childrenWindow.loadFile('src/index.html')
                  }
                }
            ]
        },
        {label:'保存'}
    ]
```
这样，当我们点击文件的子菜单新建窗口时，就能打开一个和主进程窗口一样的新的窗口，就实现了和vsCode里新建窗口一样的功能

### 菜单类型,内容区分

#### 类型区分
- checkbox
- separator
- radio
- submenu

``` js
const template = [
        {label:'文件1',type:'checkbox'}, //带勾选效果的菜单
        {label:'保存1',type:'checkbox'},
        {type:'separator'}, //菜单中的分隔符
        {label:'文件2',type:'radio'}, //带单选框的菜单
        {label:'保存2',type:'radio'},
        {type:'separator'}
        {label:'文件3',type:'submenu',role:'windowMenu'}, //菜单中的二级菜单
    ]
```

#### 内容区分

通过role属性来区分菜单内容功能，例如：

``` js
const template = [
        {label:'复制',role:'copy'}, 
        {label:'剪切',role:'cut'},
        {label:'粘贴',role:'paste'}, 
        {label:'最小化',role:'minimize'},
    ]
```


### 窗口配置

如果我们希望不适用electron的默认菜单，那么我们可以在主进程文件的new BrowserWindow中添加配置，达到生成一个无边框窗口的目的
``` js
new BrowserWindow({
    width:300,
    height:300,
    frame:false, //取消窗口默认菜单,注意：此属性会把menu菜单和标题title栏全部隐藏
    autoHideMenuBar:true //只隐藏默认菜单，不隐藏title栏
})
```

如果我们有自己的icon和title，我们可以进行配置
``` js
new BrowserWindow({
    width:300,
    height:300,
    frame:false, //取消窗口默认菜单,注意：此属性会把menu菜单和标题title栏全部隐藏
    autoHideMenuBar:true, //只隐藏默认菜单，不隐藏title栏
    icon: //图标名称
})
```
title的配置可以使用主窗口引用的index.html文件的title属性，或者将此title属性置空，然后在窗口属性中配置
``` js
//1，直接在主窗口引用的index.html中配置
<title>test-Electron</title>
//2，在窗口属性中配置
<title></title>//title必须置空
new BrowserWindow({
    width:300,
    height:300,
    frame:false, //取消窗口默认菜单,注意：此属性会把menu菜单和标题title栏全部隐藏
    autoHideMenuBar:true, //只隐藏默认菜单，不隐藏title栏
    icon: XXX,//图标名称
    title:'test-Electron'
})
```

### 自定义窗口菜单编写

在渲染进程的index.html页面，添加自定义窗口菜单代码，并引入样式
``` js
<link rel="stylesheet" href="index.css">
<div class="menu">
    <ul>
        <li id="oBtn">新建窗口</li>
    </ul>
</div>
```

创建对应的js文件并通过js方法实现新建窗口操作,同时在html页面引用js

``` js
//index.js文件
const {BrowserWindow} = require('@electron/remote')
let oBtn=document.getElementById('oBtn')
oBtn.addEventListener('click',()=>{
    const childrenWindow = new BrowserWindow({
        width:300,
        height:300
    })
    childrenWindow.loadFile('./index.html')
})
//html中引用
<script src="index.js"></script>
```

由于安全性问题的考虑，electron不希望渲染进程中使用node模块，所以这个js文件中的require会报错，需要在主进程的窗口配置中进行配置node模块的开启

``` js
const mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        // frame:false
        autoHideMenuBar:true,
        title:'test-Electron',
        webPreferences:{
            //最新的版本处理方式，下面两项都需要进行配置，才能保证require方法在渲染进程中可以使用
            nodeIntegration:true, 
            contextIsolation:false
        }
    })
```

此时require的报错已经解决，但是BrowserWindow会报错unDefined,同样需要通过配置开启remote模块，用来在渲染进程中可以引用electron中的方法

- 安装@electron/remote
``` js
cnpm install --save @electron/remote
```
- 在main.js中进行如下配置

``` js
//最上方引用
const remote = require('@electron/remote/main')
remote.initialize()
```

``` js
//在ready生命周期中开启
app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        // frame:false
        autoHideMenuBar:true,
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
                        width:300,
                        height:300
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
这样，自定义菜单栏及功能就可以正常使用了










