
var $_get=[];

var tmp=document.location.search.replace("?","").split("&");
$(tmp).each(function(){
var v=this.split("=");

$_get[v[0]]=v[1];

});

var app=new Vue({
  el:"#app",
  data: {
        pages: [],
        path:(undefined!==$_get['page'])?cutPath($_get['page']):"/",
        offset:0,
        limit:5,
        count:0,
    },
  created: function(){
    getPages(this.path,this.offset,this.limit);
    this.$on("selectNode",function(node){
      this.path=node.url;
    });
    this.$on("openFolder",function(page){
      if(page.folder){
        this.path=page.path;
      }});
    this.$on("pageChanged",function(page){
      this.offset=(page-1)*this.limit;
      getPages(this.path,this.offset,this.limit);
    });
    this.$on("limitChanged",function(limit){
      this.limit=limit;
      getPages(this.path,this.offset,this.limit);
    });
  },
  computed:{
    current_page:function(){return Math.floor(this.offset/this.limit)+1;},
    new_page_url:function(){
      return "pages/?page="+this.path;
    }
  },
  watch:{
    path:function(val){
      this.offset=0;
      getPages(val,this.offset,this.limit);
    },
    offset:function(val){
      getPages(this.path,val,this.limit);
    },
    limit:function(val){
      getPages(this.path,this.offset,val);
    }
  }

});


if($("#page-edit").size()==1){
var pEdit=new Vue({
  el: "#page-edit",
  data: {
    name:$("#page-edit [name=name]").val(),
    url:$("#page-edit [name=url]").val().replace(/\/\//,"/"),
    saving:false
  },
  computed:{
    path:function(){
      var same_folder=(this.url.split("/").length==(window.old_path.split("/").length));

      if((/\/index\.html$/).test(window.old_path)&&(same_folder)){
        return this.url.replace(/(\/|)$/,'/index.html');
      }
      return this.url.replace(/(\/|)$/,'.html');
    }
  },
  methods:{
    savePage:function(btn){
    this.saving=true;
      window.blocks={};
      $('[name^="blocks["]').each(function(){
        var tmp=$(this).attr("id").split("_");

        var name=tmp[1];
        var value=$(this).val();
        if( $(this).hasClass("richText")){
          value=tinymce.get("block_"+name).getContent();
        }
        window.blocks[name]=value;

      });
      var data={
        "path":$('[name=path]').val(),
        "template":$('[name=template]').val(),
        "name":$('[name=name]').val(),
        "blocks":window.blocks,
        "fields":[],
        "old_path":window.old_path
      };


        $.ajax({
            url:"/actions/EselAdminPanel/savePage",
            data:data,
            method:"POST",
            success:function(res){
              pEdit.saving=false;
              if((data.old_path!=data.path)&&(res.success)){
                document.location.href=document.location.href.replace(/\?page=(.*)/,"?page="+data.path);
              }
            }

        }
      ).always(function(res){
        console.log(res);
        pEdit.saving=false;
      });
      return true;
    },
    copyPage:function(btn){
      this.saving=true;
        window.blocks={};
        $('[name^="blocks["]').each(function(){
          var tmp=$(this).attr("id").split("_");

          var name=tmp[1];
          var value=$(this).val();
          if( $(this).hasClass("richText")){
            value=tinymce.get("block_content").getContent();
          }
          window.blocks[name]=value;
          console.log(blocks);
        });
        var data={
          "path":$('[name=path]').val(),
          "template":$('[name=template]').val(),
          "name":$('[name=name]').val()!=""?$('[name=name]').val():'New page',
          "blocks":window.blocks
        };

          $.ajax({
              url:"/actions/EselAdminPanel/savePage",
              data:data,
              method:"POST",
              success:function(res){
                pEdit.saving=false;
                if(data.old_path!=data.path){
                  document.location.href=document.location.href.replace(/\?page=(.*)/,"?page="+data.path);
                }
              }

          }
        ).always(function(res){
          pEdit.saving=false;
        });
        return true;
    },
    deletePage:function(btn){
      pEdit.saving=true;
      $.ajax({
          url:"/actions/EselAdminPanel/deletePage",
          data:{"path":window.old_path},
          method:"POST",
          success:function(res){
            pEdit.saving=false;
            if(res.success){
            document.location.href=document.location.href.replace(/[^\/]+\.html$/,"");
            }

          }

      }
      ).always(function(res){
      pEdit.saving=false;
      console.log(res);
      });
    },

    changeTemplate:function(){
      document.location.href=updateQueryStringParameter(document.location.href,"template",$('[name=template]').val());
    }
  }
});

}

$(window).resize(function(){
  fixFullHeight();
});
function fixFullHeight() {
    $(".fullheight").innerHeight($(window).innerHeight() - $("#header").innerHeight() - $("#footer").innerHeight());
}
fixFullHeight();


  tinymce.init({ selector:'.richText' });
  $(".dropdown").dropdown();
