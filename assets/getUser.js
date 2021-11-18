import Vue from 'vue'

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export default (list, key, cab) => {
    // 在这里需要给list item 设置 四个属性 head_image ,user_name ,has_head_image, image_color
    // 如果头像 则是 head_image = xx ， user_name = xx， has_head_image = true
    // 如果没有头像 则是 head_image = null ， user_name = xx， has_head_image = false , image_color = '#xxx'
    var color = ['#C80001', '#3296FA', '#138908', '#E56946', '#16C5CA', '#0615B1', '#AD43E9', '#F59226', '#F1BBEF',]

    var me = Vue.prototype
    key = key || 'id'
    // 获取列表中用户头像
    var userIdList = []
    me.each(list, (item) => {
        var id = Number(item[key])
        if (isNaN(id)) {
            // 这种不能查到头像的  一律认定没有头像 至于名字 也是无法查到的
            me.$set(item, 'has_head_image', false)
            me.$set(item, 'image_color', color[random(0, 8)])
            return
        }
        userIdList.push(id)
        // 测试代码  针对没有头像的
        me.$set(item, 'has_head_image', true)
        me.$set(item, 'user_name', item.user_name)
        me.$set(item, 'head_image', '')

    })

    // 由于接口暂时没有 放开针对没有 token 的用户访问 所以这里暂时不写
    /* if (list.length !== 0) {

        var url
        var serverPath = window.params.serverPath || ''
        // 判断是不是在exe 中 exe 中不用代理
        url = serverPath + '/api/sys_management/users/breif_info'


        me.get(url + me.seParams({users_ids: userIdList.join(',')}), (data) => {
            me.each(list, (item, i) => {
				console.log("+++++++++++++++++++++",data)
                me.each(data.result, (item2) => {
                    if (item2.id === Number(item[key])) {
                        item.head_image = item2.head_image
                        item.user_name = item2.name
                        return true
                    }
                })
            })
            cab && cab()

        }, (data) => {
        })
    } */
}
