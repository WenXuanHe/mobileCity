/**
 * Created by wenxuan on 2016/2/26.
 */
(function(win){
    var my={};
    $.fn.scrollTo =function(options){
        var defaults = {
            toT : 0,    //滚动目标位置
            durTime : 500,  //过渡动画时间
            delay : 30,     //定时器时间
            callback:null   //回调函数
        };
        var opts = $.extend(defaults,options),
            timer = null,
            _this = this,
            curTop = _this.scrollTop(),//滚动条当前的位置
            subTop = opts.toT - curTop,    //滚动条目标位置和当前位置的差值
            index = 0,
            dur = Math.round(opts.durTime / opts.delay),
            smoothScroll = function(t){
                index++;
                var per = Math.round(subTop/dur);
                if(index >= dur){
                    _this.scrollTop(t);
                    window.clearInterval(timer);
                    if(opts.callback && typeof opts.callback == 'function'){
                        opts.callback();
                    }
                    return;
                }else{
                    _this.scrollTop(curTop + index*per);
                }
            };
        timer = window.setInterval(function(){
            smoothScroll(opts.toT);
        }, opts.delay);
        return _this;
    };
    my.utils= {
        setting:{
            citys:"",
            history:['鄂尔多斯', '阿克苏', '澳门', '北京']
        },
        GLOBAL:'',
        formatTemplatePath : function (name) {
            return "template/" + name + ".tmpl.html";
        },
        ////显示到页面上
        renderTemplate : function (_v) {
            ////转换数据
            var cityList = my.utils.changeData(_v.citysFlight);
            var filePath = my.utils.formatTemplatePath(_v.tmplName);
            $.get(filePath, null, function (template) {
                var jsrender = window.jsrender;
                var tmpl = jsrender.templates(template);
                var htmlString = tmpl.render(cityList);
                if (_v.targetSelector) {
                    $(_v.targetSelector).html(htmlString);
                    $("#citySelect").show();
                }
                return htmlString;
            });
        },

        getCitys:function(obj, fn){
            my.utils.GLOBAL = {
                tmplName:obj.templateName,
                targetSelector:obj.targetSelector || "body",
                citysFlight:obj.citysData
            };
            ////设置历史城市
            my.utils.setHistoryCity(my.utils.setting.history);
            ////可以直接传入要设置的热门城市
            if(obj.hotCity && obj.hotCity instanceof Array){
                my.utils.setting.citys = obj.hotCity;
            }
            ////设置热门城市
            if(!my.utils.hasSetHotCity){ ////是否已经设置过了？
                my.utils.setHotCity(my.utils.setting.citys);
            }else{
                delete my.utils.hasSetHotCity;
                my.utils.renderTemplate(my.utils.GLOBAL);
            }
            my.utils.eventListen(my.utils.GLOBAL, fn);
        },
        returnData : function(_v, obj){
            var back="";
            if($(obj).find('.cityName')){
                for(var i in _v.citysFlight){
                    if($(obj).find('.cityName').text().replace(/^\s+|\s+$/g, '') === _v.citysFlight[i][1].replace(/^\s+|\s+$/g, '')){
                        if($(obj).find('.cityName').attr('shortName').replace(/^\s+|\s+$/g, '') === _v.citysFlight[i][0].replace(/^\s+|\s+$/g, '')){
                            back = _v.citysFlight[i];
                            $("#storeData").val(back);
                            return back;
                        }

                    }
                }
            }
        },
        eventListen : function(_v, fn){
            $("dd").live("click", function(){
                var  data = my.utils.returnData(_v, this);
                $("#citySelect").hide();
                fn(data);
            });
            $(".iCity-nav li").live("click", function(){
                $(this).addClass("active").siblings().removeClass("active");
            });
            $(".right-position a").live("click", function(){
                var c = this.className;
                var offsetTop = $("#"+c).offset().top - 96;
                $("body").scrollTo({toT:offsetTop});
            });
        },
        setHistoryCity:function(citys){
            my.utils.removeAttr('history');
            my.utils.setAttr(citys, 'history');
        },
        setHotCity : function(citys){
            ////如果传入的不是数组，转化为数组
            if(!(citys instanceof Array)) {
                citys = Array.prototype.slice.call(arguments);
            }
            ////在调用之前设置的热门城市
            if(my.utils.GLOBAL===""){
                my.utils.setting.citys = citys;
                return;
            }
            ////重置热门城市之前，先移除所有的热门城市
            my.utils.removeAttr('hot');
            my.utils.setAttr(citys, 'hot');
        },
        setAttr:function(citys, type){
            var len = citys.length;
            if(citys instanceof Array && len > 0){
                for(var i=0; i < citys.length; i++){
                    for(var j = 0; j < my.utils.GLOBAL.citysFlight.length; j++){
                        if(citys[i] === my.utils.GLOBAL.citysFlight[j][1]){
                            my.utils.GLOBAL.citysFlight[j].push(type);
                            type ==='hot'? my.utils.hasSetHotCity = 1 : my.utils.hasSetHistoryCity = 1;
                        }
                    }
                }
            }
            else{
                ////没有设置热门城市，就默认设置前30个城市
                for(j=0; j< my.utils.GLOBAL.citysFlight.length; j++){
                    if(j< 30){
                        my.utils.GLOBAL.citysFlight[j].push(type);
                    }
                }
            }
            ////无论何时设置热门城市后，立刻显示在页面上
            my.utils.renderTemplate(my.utils.GLOBAL);
        },
        removeAttr:function(type){
            for(var i in my.utils.GLOBAL.citysFlight){
                if(my.utils.GLOBAL.citysFlight[i][5]===type){
                    my.utils.GLOBAL.citysFlight[i].splice(5,1);
                }else if(my.utils.GLOBAL.citysFlight[i][6]===type){
                    my.utils.GLOBAL.citysFlight[i].splice(6,1);
                }
            }
        },
        changeData : function(citysFlight){
            var cityList={};
            citysFlight.sort(function(x, y){
                return x[2].charAt(0).toLowerCase() > y[2].charAt(0).toLowerCase() ? 1: -1;
            });
            ////普通城市的数据
            for(var i=0; i< citysFlight.length; i++){
                var firstLetter = citysFlight[i][2].charAt(0).toUpperCase();
                if(!cityList[firstLetter]){
                    cityList[firstLetter]={};
                    cityList[firstLetter][0]=citysFlight[i];
                    cityList[firstLetter].length=1;
                }else{
                    cityList[firstLetter][cityList[firstLetter].length]=citysFlight[i];
                    cityList[firstLetter].length++;
                }
            }
            return cityList;
        }
    };


    win.onload = function(){
        my.utils.setHotCity('阿拉善右旗', '安庆');
        my.utils.getCitys({
                templateName:"city",
                targetSelector:"body",
                citysData:citysFlight
            }, function(data){
                alert(data);
            });

    }
})(window);