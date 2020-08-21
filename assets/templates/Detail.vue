<template>
  <section class="page-bill-detail">
    <div class="fm-box-breadcrumb bordered">
      <bread-crumb :path="pagePath"></bread-crumb>
    </div>

    <!-- 详情信息展示 -->
    <div class="fm-content-block bed-detail" v-loading="loading">
      <div class="fm-page-title sm border-bottom">
        账单基本信息
      </div>
      <div class="box-detail">
        <div class="cell">
          <label-detail :label="'站点名称：'" :value="detail.siteName"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'站点类型：'" :value="formatDictValue(detail.siteType, 'siteTypes')"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'站点编号：'" :value="detail.siteNo"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'所属分公司：'" :value="detail.upSubOrgName"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'所属拓展机构：'" :value="detail.extOrgName"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'上级拓展机构：'" :value="detail.pareExtOrgNm"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'所属运营机构：'" :value="detail.operOrgName"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'上级运营机构：'" :value="detail.pareOperOrgNm"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'站长姓名：'" :value="detail.masterName"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'交易对象：'" :value="detail.userName"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'农户编号：'" :value="detail.userNo"></label-detail>
        </div>
      </div>

      <div class="fm-page-title sm border-bottom">
        账单支付信息
        <span class="box-bill-no">
          账单编号：<span class="no">{{ billNo }}</span>
        </span>
      </div>
      <div class="box-pay-info">
        <div class="cell">
          <label-detail :label="'账单总金额(元)：'" :value="fenToYuan(detail.totalAmount)"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'账单状态：'" :value="detail.billStatus"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'账单类型：'" :value="detail.billType"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'支付类型：'" :value="detail.payType"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'合并支付：'" :value="detail.unionStatus"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'支付流水号：'" :value="detail.payReqId"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'汇出银行卡号：'" :value="detail.outCertNo"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'汇入银行卡号：'" :value="detail.inCertNo"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'创建时间：'" :value="detail.createTime"></label-detail>
        </div>
        <div class="cell">
          <label-detail :label="'支付时间：'" :value="detail.payTime"></label-detail>
        </div>
        <!-- <div class="cell">
          <label-detail :label="'更新时间：'" :value="detail.updateTime"></label-detail>
        </div> -->
      </div>
    </div>

    <div class="box-btns">
      <el-button type="primary" size="small" :disabled="loading" @click="goBack()">返回上一步</el-button>
    </div>
  </section>
</template>

<script>
// import eventBus from '@/EventBus'
import { queryBillDetail } from '@/api/trade'
import system from '@/models/system'
import dictMap from '@/models/dictMap'
import filterCtrl from '@/ctrls/FilterCtrl'
import BreadCrumb from '@/components/BreadCrumb'
import LabelDetail from '@/components/LabelDetail'

export default {
  data () {
    return {
      loading: false,
      // mode: 'display', // 模式，display - 展示，edit - 编辑
      billNo: '',
      pagePath: ['首页', '交易管理', '账单详情'],
      // detailExtended: false, // 站点详情是否全部展开
      detail: {
        siteName: '',
        siteType: '',
        siteNo: '',
        upSubOrgName: '',
        extOrgName: '',
        pareExtOrgNm: '',
        operOrgName: '',
        pareOperOrgNm: '',
        masterName: '',
        userName: '',
        userNo: '',
        totalAmount: '',
        billStatus: '',
        billType: '',
        payType: '',
        unionStatus: '',
        payReqId: '',
        outCertNo: '',
        inCertNo: '',
        createTime: '',
        payTime: ''
      }
    }
  },

  components: {
    BreadCrumb,
    LabelDetail
  },

  mounted () {
    const query = this.$route.query
    if (!query.billNo) {
      this.$message({
        message: '非法访问！请退出重试',
        type: 'error'
      })
      return false
    }
    this.billNo = query.billNo
    this.getBillInfo()
  },

  methods: {
    // toggleExtend () {
    //   this.detailExtended = !this.detailExtended
    // },
    getBillInfo () {
      if (this.loading) {
        return
      }
      let params = {
        billNo: this.billNo
      }
      this.loading = true
      queryBillDetail(params).then(data => {
        // 成功
        this.loading = false
        if (data?.respCode === system.okCode) {
          const detail = data.data || {}
          this.detail = Object.assign({}, this.detail, detail)
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
    goBack () {
      this.$router.go(-1)
    },
    formatDictValue (val, cat) {
      return dictMap[cat].find(item => item.key === val)?.text || val
    },
    fenToYuan (val) {
      return filterCtrl.fenToYuan(val)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-bill-detail {
  position: relative;
  padding-bottom: 76px;
  .bed-detail {
    .fm-page-title {
      position: relative;
      padding-top: 18px;
      padding-bottom: 18px;
      .box-bill-no {
        position: absolute;
        right: 0;
        top: 18px;
        color: #2a2a2a;
        font-size: 14px;
        font-weight: normal;
        .no {
          color: #666;
        }
      }
    }
    .box-detail, .box-pay-info {
      padding: 15px 0;
      .cell {
        display: inline-block;
        width: 25%;
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
  .box-btns {
    // position: fixed;
    // left: 240px;
    // right: 0;
    // bottom: 0;
    height: 76px;
    line-height: 76px;
    background: #FFFFFF;
    text-align: center;
    // box-shadow: 14px -5px 16px 0 rgba(189,189,189,0.34);
    // z-index: 2;
  }
}
</style>
