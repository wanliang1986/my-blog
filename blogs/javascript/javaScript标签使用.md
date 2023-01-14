---
title: javaScript 标签使用
date: '2023-1-14'
sidebar: 'auto'
categories:
 - javaScript
tags:
 - javaScript
---

::: tip
   在Html页面中，我们会引入外部js，但是这些js文件是有执行顺序的，我们需要对此有一定的了解，在引用js文件时确定其执行顺序
:::

<!-- more -->

## javaScript元素标签常用属性
   
在Html页面插入JavaScript的主要方法，就是使用 `<script>` 元素，其常用的属性有以下几个：async，defer,src,type。我们主要看下async，defer两个属性的作用


### 正常情况下的执行顺序

example1.js文件内容
``` js

function a() {
    console.log('example1-a')
}
a()

```

example2.js文件内容
``` js

function b() {
    console.log('example2-b')
}
b()

```

html 写法
``` js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="text/javascript" src="./example1.js"></script>
    <script type="text/javascript" src="./example2.js"></script>
</head>
<body>
    <div>正常顺序</div>
</body>
</html>

```

控制台打印可以得到结果

``` js
example1-a
example2-b

```

把所有`<script>`元素都放在`<head>`元素中,可以看到，js的执行顺序是按照引入js的顺序来执行的，同时，这种写法也意味着必须等到所有的js脚本都被执行后，才开始呈现页面内容

 
### async属性

--- 
   async 属性为可选属性，表示该脚本立即下载，但是不妨碍页面中其他的操作，此属性只适用于外部脚本。

---

例：我们多加几2个js文件，来验证async的异步顺序
``` js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="text/javascript" src="./example1.js"></script>
    <script type="text/javascript" async="async" src="./example2.js"></script>
    <script type="text/javascript"  src="./example3.js"></script>
    <script type="text/javascript" src="./example4.js"></script>
</head>
<body>
    <div>async 执行顺序</div>
</body>
</html>

```

控制台打印结果可能得到下面的情况
``` js
example1-a
example2-b
example3-c
example4-d
```
``` js
example1-a
example3-c
example4-d
example2-b
```
``` js
example1-a
example3-c
example2-b
example4-d
```
可以看出，根据js文件的复杂程度，async属性可能会改变原有的js的加载顺序。注意：async属性的js脚本一定会在页面的load事件执行。
Async是异步加载，而不是优先加载，因此example2.js文件添加了async属性后，当文件加载到js3,同时开始加载example2.js之后的文件，于是便出现了上图1,3,4,2或者1,3,2,4的结果，当然这个结果不是必然的，因为我们的demo里面的代码非常简短，如果./example3.js，./example4.js中的代码逻辑复杂，那么结果可能任然是1,2,3,4。所以，async属性并不是一定会按照你预想的结果去执行，没有把握的时候不建议使用。

 
### defer属性

--- 
   defer 属性是表明脚本在执行时不会影响页面的构造，也就是说，脚本的执行会颜值到整个页面都解析完成后再运行

---

例：

``` js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="text/javascript" src="./example1.js"></script>
    <script type="text/javascript" defer="defer" src="./example2.js"></script>
    <script type="text/javascript"  src="./example3.js"></script>
    <script type="text/javascript" src="./example4.js"></script>
</head>
<body>
    <div>defer 执行顺序</div>
</body>
</html>
```

控制台打印可以得到结果

``` js
example1-a
example3-c
example4-d
example2-b
```
可以看出，我们标记的defer的属性的example2.js被最后执行了，defer属性和async一样会改变js脚本的执行顺序，但是可以确定的是，如果有一个js脚本添加defer属性，那它一定是最后执行的，
所以当我们打印结果时，得到的结果会比async的要少。

