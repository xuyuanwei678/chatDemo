<!--author:徐晨-->
<!--北京汉唐自远技术股份有限公司-->
<template>
    <div>
        <!--transition[name="el-fade-in-linear"]-->
        <transition name="el-fade-in-linear">
            <div id="u-cofirm" class="shade" v-show="show">
                <div class="shade_box">
                    <div class="shade_title">{{title}}<i @click="methods.cancelFun()">×</i>
                    </div>
                    <div class="u-content">
                        <p><i class="iconfont icon-tishi"></i>{{msg}}</p>
                    </div>
                    <div class="shade_btncon" style="text-align: center;">
                        <button @click="methods.cancelFun()">{{buttonTitle.cancel}}</button>
                        <button class="shade_affirm" @click="methods.affirmFun()">{{buttonTitle.affirm}}</button>
                    </div>
                </div>
            </div>
        </transition>


    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        name: 'confirm',
        data: function data() {
            return {
                show: false,
                msg: '',
                title: '',
                methods: {
                    cancelFun: null,
                    affirmFun: null
                },
                buttonTitle: {
                    cancel: '取消',
                    affirm: '确定'
                }
            };
        },

        methods: {
            confirm: function confirm(msg, title, fun1, fun2, buttonTitles) {
                var me = this;
                me.buttonTitle = {
                    cancel: '取消',
                    affirm: '确定'
                };
                me.msg = msg;
                me.show = true;
                me.methods = {
                    cancelFun: function cancelFun() {
                        me.show = false;
                        fun2 && fun2();
                    },
                    affirmFun: function affirmFun() {
                        me.show = false;
                        fun1 && fun1();
                    },
                    layAsideFun: function layAsideFun() {
                        me.show = false;
                    }
                };
                if (title) {
                    this.title = title;
                }
                if (buttonTitles) {
                    me.buttonTitle = {
                        cancel: buttonTitles[1],
                        affirm: buttonTitles[0]
                    };
                }
            }
        }
    };
</script>
<style scoped>
    #u-cofirm .u-content {
        padding: 25px 10px;
        font-size: 14px;
        width: 250px;
    }

    #u-cofirm .u-content > p {
        line-height: 35px;
        text-align: center;
    }

    #u-cofirm .u-content > p > i {
        font-size: 24px;
        color: #2096F3;
        margin-right: 10px;
    }
</style>
