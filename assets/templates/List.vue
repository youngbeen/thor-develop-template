<template>
  <section class="page-sysuser-list">
    <div class="fm-content-block">
      <div class="fm-page-title">用户管理列表</div>

      <!-- 筛选栏 -->
      <div class="box-filters">
        <el-form size="small" label-position="right" label-width="90px" :model="filter" :rules="rules">
          <el-row :gutter="8">
            <el-col :span="6">
              <el-form-item label="起始日期">
                <el-date-picker
                  v-model="filter.startTime"
                  type="date"
                  size="small"
                  value-format="yyyy-MM-dd"
                  clearable
                  placeholder="请选择"
                  style="max-width: 215px; width: auto;">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="截止日期">
                <el-date-picker
                  v-model="filter.endTime"
                  type="date"
                  size="small"
                  value-format="yyyy-MM-dd"
                  clearable
                  placeholder="请选择"
                  style="max-width: 215px; width: auto;">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="状态">
                <el-select v-model="filter.sysUserStatus" placeholder="请选择" clearable style="max-width: 215px;">
                  <el-option
                    v-for="item in sysUserStatusOptions"
                    :key="item.key"
                    :label="item.text"
                    :value="item.key">
                    <el-tag type="success" size="mini" v-if="item.key === '1'">{{ item.text }}</el-tag>
                    <el-tag type="danger" size="mini" v-if="item.key === '0'">{{ item.text }}</el-tag>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="用户登录名">
                <el-input clearable placeholder="请输入" v-model="filter.loginName" style="max-width: 215px;"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="8">
            <el-col :span="6">
              <el-form-item label="昵称">
                <el-input clearable placeholder="请输入" v-model="filter.nickname" style="max-width: 215px;"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6"></el-col>
            <el-col :span="6"></el-col>
            <el-col :span="6"></el-col>
          </el-row>
          <el-row>
            <el-button type="primary" size="small" style="margin-left: 90px;" :disabled="loading" @click="handleSearch()">搜索</el-button>
            <el-button size="small" @click="handleClearFilters()">清空</el-button>
            <!-- <el-button type="text" @click="toggleAdvanceFilter()" style="margin-left: 14px;">{{ filterExtended ? '普通' : '高级' }}筛选</el-button> -->
          </el-row>
          <el-row style="margin-top: 24px;">
            <el-button type="primary" size="small" :disabled="loading" v-if="user.permissions.includes(config.permissionKey.addUser)" @click="handleAdd()"><font-awesome-icon :icon="['fas', 'plus']" /> 新增</el-button>
            <!-- <el-button size="small" :disabled="loading" @click="handleExport()">
              <font-awesome-icon :icon="['fas', 'file-download' ]"></font-awesome-icon>
              导出
            </el-button> -->
          </el-row>
        </el-form>
      </div>

      <!-- 列表 -->
      <el-table
        :data="list"
        v-loading="loading"
        style="width: 100%">
        <!-- <el-table-column
          type="index"
          label="序号"
          width="50"
          fixed="left">
        </el-table-column> -->
        <el-table-column
          prop="loginName"
          label="用户登录名"
          :show-overflow-tooltip="true">
        </el-table-column>
        <el-table-column
          prop="nickname"
          label="昵称"
          :show-overflow-tooltip="true">
        </el-table-column>
        <el-table-column
          prop="orgName"
          label="所属机构"
          :show-overflow-tooltip="true">
        </el-table-column>
        <el-table-column
          prop="roleName"
          label="角色"
          :show-overflow-tooltip="true">
        </el-table-column>
        <el-table-column
          prop="sysUserType"
          label="用户类型"
          :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.sysUserType | formatSysUserType }}
          </template>
        </el-table-column>
        <el-table-column
          prop="sysUserStatus"
          label="状态">
          <template slot-scope="scope">
            <el-tag type="success" size="mini" hit v-if="scope.row.sysUserStatus === '1'">{{ scope.row.sysUserStatus | formatSysUserStatus }}</el-tag>
            <el-tag type="danger" size="mini" hit v-else-if="scope.row.sysUserStatus === '0'">{{ scope.row.sysUserStatus | formatSysUserStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="180"
          :show-overflow-tooltip="true">
        </el-table-column>
        <!-- <el-table-column
          prop="updateTime"
          label="更新时间"
          width="180"
          :show-overflow-tooltip="true">
        </el-table-column> -->
        <el-table-column
          fixed="right"
          label="操作"
          width="225">
          <template slot-scope="scope">
            <span class="action-btn" v-if="user.permissions.includes(config.permissionKey.changeUserStatus)">
              <el-button type="text" @click="handleShowActivatePop($event, scope.row)">{{ scope.row.sysUserStatus === '1' ? '停用' : '启用' }}</el-button>
            </span>
            <span class="action-btn" v-if="user.permissions.includes(config.permissionKey.editUser)">
              <el-button @click="handleEdit(scope.row)" type="text">编辑</el-button>
            </span>
            <span class="action-btn">
              <el-button @click="handleDetail(scope.row)" type="text">详情</el-button>
            </span>
            <el-dropdown class="action-btn" v-if="user.permissions.includes(config.permissionKey.resetUser) || user.permissions.includes(config.permissionKey.removeUser)" @command="handleCommand">
              <span>
                <el-button type="text">更多操作</el-button>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="user.permissions.includes(config.permissionKey.resetUser)" :command="'resetPwdTrigger-' + scope.$index" class="text-center"><el-button type="text">密码初始化</el-button></el-dropdown-item>
                <el-dropdown-item divided v-if="user.permissions.includes(config.permissionKey.removeUser)" :command="'removeTrigger-' + scope.$index" class="text-center"><el-button type="text">删除</el-button></el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="box-pager"
        layout="total, sizes, prev, pager, next, jumper"
        background
        :current-page.sync="filter.pageNo"
        :total="total"
        :page-sizes="[10, 20, 50]"
        :page-size.sync="filter.pageSize"
        @size-change="handleSizeChange()"
        @current-change="handlePageChange()">
      </el-pagination>
    </div>

    <add-edit-pop :callback="getListData"></add-edit-pop>
  </section>
</template>

<script>
import eventBus from '@/EventBus'
import { queryUserList, changeUserStatus, removeUser, resetUser } from '@/api/sysuser'
// import { queryAreaNodes } from '@/api/common'
import dictMap from '@/models/dictMap'
import system from '@/models/system'
import config from '@/models/config'
import user from '@/models/user'
import AddEditPop from './components/AddEditPop'

export default {
  data () {
    return {
      loading: false,
      // filterExtended: false, // 高级筛选是否展开
      filter: {
        startTime: '',
        endTime: '',
        sysUserStatus: '',
        loginName: '',
        nickname: '',
        pageNo: 1,
        pageSize: 10
      },
      rules: {},
      sysUserStatusOptions: dictMap.sysUserStatus,
      total: 0,
      list: [
        // {
        //   loginName: '39200001',
        //   nickname: 'zhangsan',
        //   orgName: '挖机',
        //   roleName: '',
        //   sysUserType: 'common',
        //   sysUserStatus: '1',
        //   post: '',
        //   createTime: ''
        // }
      ],
      fns: {
        resetPwdTrigger: (data) => {
          this.$confirm(`确定初始化用户${data.nickname}(${data.loginName})的密码吗?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.handleResetPwd(data)
          }).catch(() => {
          })
        },
        removeTrigger: (data) => {
          this.$confirm(`确定删除用户${data.nickname}(${data.loginName})吗?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.handleRemove(data)
          }).catch(() => {
          })
        }
      },
      config,
      user
    }
  },
  filters: {
    formatSysUserType (val) {
      return dictMap.sysUserTypes.find(item => item.key === val)?.text || val
    },
    formatSysUserStatus (val) {
      return dictMap.sysUserStatus.find(item => item.key === val)?.text || val
    }
  },

  components: {
    AddEditPop
  },

  mounted () {
    this.getListData()
  },

  methods: {
    handleSearch () {
      this.filter.pageNo = 1
      this.getListData()
    },
    handleClearFilters () {
      this.filter = Object.assign({}, this.filter, {
        startTime: '',
        endTime: '',
        sysUserStatus: '',
        loginName: '',
        nickname: ''
      })
    },
    // handleExport () {
    //   if (this.loading) {
    //     return
    //   }
    //   if (this.filter.startTime && this.filter.endTime) {
    //     let startTime = new Date(this.filter.startTime)
    //     let endTime = new Date(this.filter.endTime)
    //     if (startTime > endTime) {
    //       this.$message({
    //         message: '起始时间不能比截止时间晚',
    //         type: 'warning'
    //       })
    //       return
    //     }
    //   }
    //   let params = Object.assign({}, this.filter, {
    //     pageNo: '',
    //     pageSize: ''
    //   })
    //   if (params.startTime) {
    //     params.startTime += ' 00:00:00'
    //   }
    //   if (params.endTime) {
    //     params.endTime += ' 23:59:59'
    //   }
    //   if (this.areaCodes.length) {
    //     let [provCode, cityCode, areaCode] = this.areaCodes
    //     params.provCode = provCode
    //     params.cityCode = cityCode
    //     params.areaCode = areaCode
    //   }
    //   this.loading = true
    //   exportOrg(params).then(data => {
    //     // 成功
    //     this.loading = false
    //     if (Object.prototype.toString.call(data) === '[object Blob]') {
    //       // 正常下载
    //     } else {
    //       this.$message({
    //         message: `${data?.respInfo} [${data?.respCode}]`,
    //         type: 'error'
    //       })
    //     }
    //   }).catch(err => {
    //     console.warn(err)
    //     this.loading = false
    //     this.$message({
    //       message: `请求失败！请稍后重试 (${err})`,
    //       type: 'error'
    //     })
    //   })
    // },
    // toggleAdvanceFilter () {
    //   this.filterExtended = !this.filterExtended
    // },
    handlePageChange () {
      this.getListData()
    },
    handleSizeChange () {
      this.filter.pageNo = 1
      this.getListData()
    },
    handleCommand (command) {
      // console.log(command)
      let [trigger, index] = command.split('-')
      if (!trigger || !index) {
        console.warn('指令内容不正确，无法执行后续操作')
        return
      }
      index = parseInt(index)
      this.fns[trigger](this.list[index])
    },
    handleAdd () {
      if (this.loading) {
        return
      }
      eventBus.$emit('notifyEditSysUser', {
        type: 'add'
      })
    },
    handleEdit (data) {
      if (this.loading) {
        return
      }
      let params = Object.assign({}, data)
      eventBus.$emit('notifyEditSysUser', {
        type: 'edit',
        params
      })
    },
    handleDetail (data) {
      let params = Object.assign({}, data)
      eventBus.$emit('notifyEditSysUser', {
        type: 'detail',
        params
      })
    },
    handleShowActivatePop (e, data) {
      let popMsg = ''
      if (data?.sysUserStatus === '1') {
        popMsg = `确认停用该用户吗？`
      } else {
        popMsg = '确认启用该用户吗？'
      }
      eventBus.$emit('notifyShowPopover', {
        x: e.clientX || 0,
        y: e.clientY || 0,
        popMsg,
        callback: () => {
          this.toggleSysUserStatus(data)
        }
      })
    },
    toggleSysUserStatus (data) {
      if (data?.loginName) {
        if (this.loading) {
          return
        }
        let params = {
          loginName: data.loginName,
          sysUserStatus: data.sysUserStatus === '1' ? '0' : '1'
        }
        this.loading = true
        changeUserStatus(params).then(result => {
          // 成功
          this.loading = false
          if (result?.respCode === system.okCode) {
            this.$message({
              message: `${data.sysUserStatus === '1' ? '停用' : '启用'}成功`,
              type: 'success'
            })
            this.getListData()
          } else {
            this.$message({
              message: `${result?.respInfo} [${result?.respCode}]`,
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
        console.warn('缺失关键参数，无法执行启用停用操作')
      }
    },
    handleResetPwd (data) {
      if (this.loading) {
        return
      }
      if (!data?.loginName) {
        console.warn('缺失关键参数，无法执行删除操作')
        return
      }
      let params = {
        loginName: data.loginName
      }
      this.loading = true
      resetUser(params).then(data => {
        // 成功
        this.loading = false
        if (data?.respCode === system.okCode) {
          this.$alert(`初始化密码成功！登录密码为${data?.password}`, '提示', {
            confirmButtonText: '确定',
            callback: action => {
            }
          })
          this.getListData()
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
    },
    // handleShowRemovePop (e, data) {
    //   eventBus.$emit('notifyShowPopover', {
    //     x: e.clientX || 0,
    //     y: e.clientY || 0,
    //     popMsg: '确认删除该用户吗？',
    //     confirmType: 'danger',
    //     callback: () => {
    //       this.handleRemove(data)
    //     }
    //   })
    // },
    handleRemove (data) {
      if (this.loading) {
        return
      }
      if (!data?.loginName) {
        console.warn('缺失关键参数，无法执行删除操作')
        return
      }
      let params = {
        loginName: data.loginName
      }
      this.loading = true
      removeUser(params).then(data => {
        // 成功
        this.loading = false
        if (data?.respCode === system.okCode) {
          this.$message({
            message: `删除用户成功`,
            type: 'success'
          })
          this.getListData()
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
    },
    getListData () {
      if (this.loading) {
        return
      }
      if (this.filter.startTime && this.filter.endTime) {
        let startTime = new Date(this.filter.startTime)
        let endTime = new Date(this.filter.endTime)
        if (startTime > endTime) {
          this.$message({
            message: '起始时间不能比截止时间晚',
            type: 'warning'
          })
          return
        }
      }
      let params = Object.assign({}, this.filter)
      if (params.startTime) {
        params.startTime += ' 00:00:00'
      }
      if (params.endTime) {
        params.endTime += ' 23:59:59'
      }
      this.loading = true
      queryUserList(params).then(data => {
        // 成功
        this.loading = false
        if (data?.respCode === system.okCode && data?.data) {
          const detail = data.data || {}
          this.total = parseInt(detail.total) || 0
          this.list = detail.list || []
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
  }
}
</script>

<style lang="scss" scoped>
.page-sysuser-list {
  .fm-page-title {
    padding: 8px 0 24px;
  }
  .box-filters {
    margin-bottom: 16px;
  }
  .action-btn:not(:last-child) {
    margin-right: 10px;
    &:after {
      content: '|';
      position: relative;
      right: -5px;
      color: #e9e9e9;
    }
  }
  .box-pager {
    margin-top: 15px;
    text-align: right;
  }
}
</style>
