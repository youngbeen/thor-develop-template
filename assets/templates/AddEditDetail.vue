<template>
  <el-dialog
    :visible.sync="isShow"
    :modal-append-to-body="false"
    :before-close="close"
    width="613px"
    top="25vh">
    <span slot="title" class="dialog-title">{{ popTitle }}</span>
    <div class="box-container">
      <!-- 详情展示 -->
      <div class="box-detail" v-show="mode === 'detail'">
        <div class="cell">
          <label-detail :label="'用户登录名：'" :value="detail.loginName"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'昵称：'" :value="detail.nickname"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'所属机构：'" :value="detail.orgName"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'角色：'" :value="detail.roleName"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'用户类型：'" :value="formatDictValue(detail.sysUserType, 'sysUserTypes')"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'职位：'" :value="detail.post"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'状态：'" :value="formatDictValue(detail.sysUserStatus, 'sysUserStatus')"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'创建时间：'" :value="detail.createTime"></label-detail>
        </div>
      </div>

      <el-form size="small" label-position="right" label-width="100px" :inline="true" v-show="mode === 'add' || mode === 'edit'" :model="form" :rules="rules" ref="addEditSysUserForm">
        <el-form-item label="用户登录名" prop="loginName">
          <el-input v-model="form.loginName" :disabled="mode === 'edit'" placeholder="请输入" style="width: 170px;"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" style="width: 170px;"></el-input>
        </el-form-item>
        <el-form-item label="所属机构">
          <el-input v-model="form.orgName" disabled style="width: 170px;"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-input v-model="form.roleName" disabled style="width: 170px;"></el-input>
        </el-form-item>
        <el-form-item label="用户类型" v-if="mode === 'edit'">
          <el-select v-model="form.sysUserType" disabled placeholder="请选择" style="width: 170px;">
            <el-option
              v-for="item in sysUserTypeOptions"
              :key="item.key"
              :label="item.text"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="post">
          <el-input v-model="form.post" style="width: 170px;"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer" v-if="mode === 'add' || mode === 'edit'">
      <el-button size="small" @click="close()">取消</el-button>
      <el-button type="primary" size="small" :disabled="loading" @click="handleSubmit()">确定</el-button>
    </span>
    <span slot="footer" class="dialog-footer" v-else>
      <el-button type="primary" size="small" @click="close()">返回</el-button>
    </span>
  </el-dialog>
</template>

<script>
import eventBus from '@/EventBus'
import dictMap from '@/models/dictMap'
import { getUserLoginName, addUser, editUser } from '@/api/sysuser'
import system from '@/models/system'
// import config from '@/models/config'
import user from '@/models/user'
import LabelDetail from '@/components/LabelDetail'

export default {
  props: {
    callback: {
      type: Function,
      required: false,
      default: () => {}
    }
  },
  data () {
    return {
      isShow: false,
      loading: false,
      mode: 'detail', // detail | add | edit
      form: {
        loginName: '',
        nickname: '',
        orgCode: '',
        orgName: '',
        roleName: '', // 仅做展示用
        sysUserType: '',
        // sysUserStatus: '',
        post: ''
      },
      rules: {
        loginName: [
          { required: true, message: '请输入用户登录名', trigger: 'change,blur' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'change,blur' }
        ],
        post: [
          { required: true, message: '请输入职位', trigger: 'change,blur' }
        ]
      },
      sysUserTypeOptions: dictMap.sysUserTypes,
      detail: {
        loginName: '',
        nickname: '',
        orgName: '',
        roleName: '',
        sysUserType: '',
        sysUserStatus: '',
        post: '',
        createTime: ''
      },
      tag: null
    }
  },
  computed: {
    popTitle () {
      if (this.mode) {
        let titleMap = {
          detail: '用户详情',
          add: '新增用户',
          edit: '用户信息修改'
        }
        return titleMap[this.mode]
      } else {
        return ''
      }
    }
  },

  components: {
    LabelDetail
  },

  mounted () {
    eventBus.$on('notifyEditSysUser', (params) => {
      console.log(params)
      if (params?.type === 'edit') {
        // 编辑
        if (!params?.params) {
          console.warn('缺失关键参数params，无法唤起组件')
          return
        }
        this.mode = 'edit'
        let { loginName, nickname, orgName, roleName, sysUserType, post } = params.params
        this.form = Object.assign({}, {
          loginName,
          nickname,
          orgCode: '',
          orgName,
          roleName,
          sysUserType,
          post
        })
      } else if (params?.type === 'add') {
        // 新增
        this.mode = 'add'
        this.form.orgCode = user.orgCode
        this.form.orgName = user.orgName
        this.form.roleName = '普通用户'
        this.getDefaultLoginName()
      } else {
        // 展示详情
        this.mode = 'detail'
        this.detail = Object.assign({}, params.params)
      }
      this.isShow = true
    })
  },

  beforeDestroy () {
    eventBus.$off('notifyEditSysUser')
  },

  methods: {
    handleSubmit () {
      if (this.loading) {
        return
      }
      this.$refs['addEditSysUserForm'].validate((valid) => {
        if (valid) {
          let params = {
            loginName: this.form.loginName,
            nickname: this.form.nickname,
            post: this.form.post
          }
          if (this.mode === 'edit') {
            // 编辑
            this.loading = true
            editUser(params).then(data => {
              // 成功
              this.loading = false
              if (data?.respCode === system.okCode) {
                this.callback(this.tag)
                this.close()
              } else {
                this.$message({
                  message: `${data?.respInfo} [${data?.respCode}]`,
                  type: 'error'
                })
              }
            }).catch(err => {
              console.warn(err)
              this.loading = false
              this.$message({
                message: `请求失败！请稍后重试 (${err})`,
                type: 'error'
              })
            })
          } else {
            // 添加
            params = Object.assign({}, params, {
              organizeCode: this.form.orgCode
            })
            this.loading = true
            addUser(params).then(data => {
              // 成功
              this.loading = false
              if (data?.respCode === system.okCode && data?.data) {
                this.callback(this.tag)
                this.close()
                this.$alert(`添加用户成功，登录密码为${data?.password}`, '提示', {
                  confirmButtonText: '确定',
                  callback: action => {
                  }
                })
              } else {
                this.$message({
                  message: `${data?.respInfo} [${data?.respCode}]`,
                  type: 'error'
                })
              }
            }).catch(err => {
              console.warn(err)
              this.loading = false
              this.$message({
                message: `请求失败！请稍后重试 (${err})`,
                type: 'error'
              })
            })
          }
        } else {
          return false
        }
      })
    },
    getDefaultLoginName () {
      let params = {
        orgCode: user.orgCode
      }
      getUserLoginName(params).then(data => {
        // 成功
        if (data?.respCode === system.okCode && data?.data) {
          const detail = data.data || {}
          this.form.loginName = detail.loginName || ''
        } else {
          this.$message({
            message: `${data?.respInfo} [${data?.respCode}]`,
            type: 'error'
          })
        }
      }).catch(err => {
        console.warn(err)
        this.$message({
          message: `请求失败！请稍后重试 (${err})`,
          type: 'error'
        })
      })
    },
    close () {
      if (this.mode === 'add' || this.mode === 'edit') {
        this.$nextTick(() => {
          this.$refs['addEditSysUserForm'].clearValidate()
        })
      }
      this.isShow = false
      this.detail = {
        loginName: '',
        nickname: '',
        orgName: '',
        roleName: '',
        sysUserType: '',
        sysUserStatus: '',
        post: '',
        createTime: ''
      }
      this.form = {
        loginName: '',
        nickname: '',
        orgCode: '',
        orgName: '',
        roleName: '', // 仅做展示用
        sysUserType: '',
        // sysUserStatus: '',
        post: ''
      }
      this.tag = null
    },
    formatDictValue (val, cat) {
      return dictMap[cat].find(item => item.key === val)?.text || val
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-title {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}
.box-container {
  padding: 24px 24px 32px;
  .box-detail {
    // padding: 15px 0;
    .cell {
      display: inline-block;
      width: 49%;
      // height: 40px;
      line-height: 20px;
      padding: 8px 0;
      color: #333;
      font-size: 14px;
      vertical-align: top;
      .el-cascader,.el-input {
        // display: inline-block;
        max-width: 133px;
      }
    }
  }
}
/deep/.el-dialog__body {
  padding: 0;
}
/deep/.el-textarea__inner {
  background: #f7f7f7;
}
</style>
