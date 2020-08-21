#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const { prompt } = require('enquirer')
const style = require('chalk')

const info = style.cyan.bold
const success = style.green.bold
const important = style.yellow.bold
const error = style.red.bold
const tip = style.gray

const questions = [
  {
    type: 'select',
    name: 'templateType',
    message: '选择需要添加的模板',
    choices: [
      { name: 'List', message: '列表页' },
      { name: 'AddEditDetail', message: '新增/编辑/详情页', hint: '同时支持新增，编辑与详情' },
      { name: 'Detail', message: '详情页', hint: '独立的详情页' }
    ]
  },
  {
    type: 'input',
    name: 'savePath',
    message: '输入模板页面放置的路径',
    initial: 'src/views/',
    result: (val) => {
      if (val[val.length - 1] !== '/') {
        return val + '/'
      } else {
        return val
      }
    }
  }
]

let isThorProject = true // 是否是Thor生成的工程
let templateName = ''
let dest = ''

const currentPath = path.resolve('./')
let pathInfo = path.parse(currentPath)

const copyTemplate = () => {
  console.log(info(`正在往${dest}添加模板文件...`))
  fs.copy(`node_modules/thor-develop-template/assets/templates/${templateName}.vue`, `${dest}${templateName}Template.vue`).then(() => {
    console.log(success('模板文件已成功添加'))
  }).catch(err => {
    console.error(error(err))
  })
}

const run = () => {
  fs.exists('src/models/SystemConfig.js').then((exist) => {
    // 判断工程是否存在配置文件
    isThorProject = exist
    console.log(`当前工程：${info(pathInfo.name)}  状态：${isThorProject ? info('Thor工程') : important('非Thor历史工程')}  路径：${info(currentPath)}`)
  
    return prompt(questions)
  }).then(res => {
    // 已收集输入
    if (!res.templateType || !res.savePath) {
      throw new Error('非法的目标文件或者目标路径！')
    }
    templateName = res.templateType
    dest = res.savePath
    return fs.exists(`${dest}${templateName}Template.vue`)
  }).then((exist) => {
    // 判断是否存在同名文件
    if (exist) {
      // 存在同名文件
      prompt({
        type: 'confirm',
        name: 'overwriteTemplate',
        message: `发现目标路径存在同名文件${templateName}Template.vue，是否覆盖？`
      }).then(res => {
        if (res.overwriteTemplate) {
          // 覆盖
          copyTemplate()
        } else {
          // 取消
          console.log(tip('已取消'))
        }
      })
    } else {
      // 新添加
      copyTemplate()
    }
  }).catch(err => {
    console.error(error(err))
  })
}

run()
