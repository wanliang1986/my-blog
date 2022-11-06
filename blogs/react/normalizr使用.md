---
title: normalizr使用
date: '2022-10-24'
sidebar: 'auto'
categories:
 - react 相关
tags:
 - normalizr
---

:::tip
项目中经常会遇到后端给出的数据结构，不满足前端渲染所需要的数据结构，这时就需要对数据进行处理改造，变成符合前端需要的数据格式及结构，这时，就需要用要normalizr来进行数据处理
:::

<!--more-->


## normalizr简介
---
normalizr是一款json数据范式化的js库，它可以将嵌套的json格式扁平化，方便被redux利用。在项目中，我们通常运用normalizr进行数据格式化，来满足前端对数据格式的特定需求。

---
## normalizr安装
``` js
yarn add normalizr
npm install normalizr
```

## normalizr使用

#### 首选，我们定义一个json数据(官网示例)
``` js
const data = {
  "id": "123",
  "author": {
    "id": "1",
    "name": "Paul"
  },
  "title": "My awesome blog post",
  "comments": [
    {
      "id": "324",
      "commenter": {
        "id": "2",
        "name": "Nicole"
      }
    }
  ]
}
```
#### 调用
##### 首先我们需要定义我们所需要结构的schema
``` js
import { normalize, schema } from 'normalizr';
const user = new schema.Entity('user')
//shcema 参数，第一个参数(字符串user)，这个user是定义我们通过normaize转换后实体类的key名，
//const user = new schema.Entity('user')表明，我们创建了一个新的以user为key的实体类
const normalizeData = normalize(data,user)
```
##### 打印结果我们可得到
``` js
console.log(normalizeData)
{
    "entities":{
        "user":{
            "123":{
                'id':'123',
                'title':'My awesome blog post',
                "author": {
                    "id": "1",
                    "name": "Paul"
                    },
                
                },
                "comments": [
                    {
                    "id": "324",
                    "commenter": {
                        "id": "2",
                        "name": "Nicole"
                    }
                    }
                ]
        }
    },
    'result':'123'
}
```
可以看到打印结果，我们拿到了一个user的实体类，实体类中，默认用原本data数据中的id做为key。当我们知道这个id，需要获取这个id的对应数据的时候，就可以通过user.id的形式拿到数据
当我们拿到数组的数据，我们需要拿到这个数组中对应的id的数据时，就可以采用这种方式处理数据，不需要通过遍历数组来获取

``` js
const data =  [
    {
        "id": "123",
        "author": {
            "id": "1",
            "name": "Paul"
        },
        "title": "My awesome blog post",
        "comments": [
            {
                "id": "324",
                "commenter": {
                    "id": "2",
                    "name": "Nicole"
                }
            }
        ]
    },
    {
        "id": "234",
        "author": {
            "id": "2",
            "name": "Paul"
        },
        "title": "My awesome blog post",
        "comments": [
            {
                "id": "222",
                "commenter": {
                    "id": "3",
                    "name": "Nicole"
                }
            }
        ]
    }
]

const user = new schema.Entity('user')

const normalizeDta = normalize(data,[user])
//注意，这个位置需要在user外加上[],这样normalize方法处理数据时才会读取data数组中的每一项，并生产新的实体类
console.log(normalizeDta)

```
打印结果可以得到
``` js
{
    "entities":{
        "user":{
            "123":{
                'id':'123',
                'title':'My awesome blog post',
                "author": {
                    "id": "1",
                    "name": "Paul"
                    },
                "comments": [
                    {
                    "id": "324",
                    "commenter": {
                        "id": "2",
                        "name": "Nicole"
                    }
                    }
                ]
                },
            "234":{
                'id':'234',
                'title':'My awesome blog post',
                "author": {
                    "id": "1",
                    "name": "Paul"
                    },
                "comments": [
                    {
                    "id": "222",
                    "commenter": {
                        "id": "3",
                        "name": "Nicole"
                    }
                    }
                ]
                },
                
        }
    },
    'result':['123','234']
}
```

## schema其他参数使用

#### schema 的第二个参数，用于内容的提取嵌套,例如，我们需要提取data中的author和comments

``` js
const author = new schema.Entity('author')
const comments = new schema.Entity('comments')
const user = new schema.Entity('user',{
    author,
    comments:[comments]
    //因为data中的comments是数组，所以这个地方需要带上中括号
})
const normalizeDta = normalize(data,user)

```
打印结果可得到
``` js
{
    "entities":{
        "author":{
            "1":{
                "id": "1",
                "name": "Paul"
                }
        },
        "comments":{
            "324":{
                "id": "324",
                    "commenter": {
                        "id": "2",
                        "name": "Nicole"
                    }
                }
        },
        "user":{
            "123":{
                'id':'123',
                'title':'My awesome blog post',
                "author": {
                    "id": "1",
                    "name": "Paul"
                    },
                
                },
                "comments": [
                    {
                    "id": "324",
                    "commenter": {
                        "id": "2",
                        "name": "Nicole"
                    }
                    }
                ]
        }
    },
    'result':'123'
}
```
可以看出，通过提取嵌套，我们得到新的实体类中多出了两个字段，author和comments,对应的就是data中的author和comments的数据

schema通常会将数据中的id字段作为默认的key来进行处理，当数据中没有id这个key或者需要用其他字段作为key来使用时，就需要用到schema的第三个参数，进行数据的预处理
预处理方法常用的有两个：idAttribute（返回数据中值作为id的key），processStrategy（预处理，通过该方法添加额外参数或者默认值等）

``` js
const data = {
    name:'xxx',
    title:'abc',
    msg:'223344',
    date:'2022-10-25',
    id:'10'
}
//现在，我们希望以时间date作为key进行数据处理
const user = new schema.Entity('user',{},{idAttribute:(value)=>value.date})
const normalizeDta = normalize(data,user)
console.log(normalizeDta)
//打印结果可以得到
{
    "entities":{
        "user":{
            "2022-10-25":{
                name:'xxx',
                title:'abc',
                msg:'223344',
                date:'2022-10-25',
                id:'10'
            }
    },
    'result':'2022-10-25'
}
//可以看到，原本默认作为key的id值，变成了date值
```
当我们希望对原本数据中的data结构进行处理时，我们就需要用到processStrategy函数进行数据预处理
``` js
const data = {
    name:'xxx',
    title:'abc',
    msg:'223344',
    date:'2022-10-25',
    id:'10'
}
const user = new schema.Entity('user',{},{processStrategy:(value)=>{
    return {
        msg_title:value.msg+'-'+value.title，
        ...value
    }
}})
const normalizeDta = normalize(data,user)
console.log(normalizeDta)
//打印结果可以得到
{
    "entities":{
        "user":{
            "10":{
                name:'xxx',
                title:'abc',
                msg:'223344',
                date:'2022-10-25',
                msg_title:'223344-abc'
                id:'10'
            }
    },
    'result':'10'
}
//可以看出我们再返回对象中添加了一个msg_title的字段，用value的msg与title进行组合的数据生效了
```

以上就是normalizr的基本运用，欢迎指正