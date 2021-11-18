// 引入配置文件
import appConfig from '@/../appConfig'

var routerCom = {}

routerCom.routerFilter = (router, routerList) => {
    // 这里本应该传入 router  但是router 作为全局变量可以访问 所以在这里 添加 访问拦截 1是 判断权限 2 是获取 token
    var alertObj = null
    router.beforeEach((to, from, next) => {
        // 这里验证token  如果存在 则 next  如果不存在  则使用 刷新token 得到 访问token 后 执行next() 34.58  48.47
        var me = router.app

        // next()
        // return

        // 在登录页 不判断token
        var toName = to.name


        next()

    })
}

export default routerCom
