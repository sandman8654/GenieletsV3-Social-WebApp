(function(){var r,t;r=window.jQuery||("function"==typeof require?require("jquery"):void 0),t=r(document),r.turbo={version:"2.0.2",isReady:!1,use:function(r,o){return t.off(".turbo").on(""+r+".turbo",this.onLoad).on(""+o+".turbo",this.onFetch)},addCallback:function(o){return r.turbo.isReady?o(r):t.on("turbo:ready",function(){return o(r)})},onLoad:function(){return r.turbo.isReady=!0,t.trigger("turbo:ready")},onFetch:function(){return r.turbo.isReady=!1},register:function(){return r(this.onLoad),r.fn.ready=this.addCallback}},r.turbo.register(),r.turbo.use("page:load","page:fetch")}).call(this);