window.onscroll = function() {
    scrollSearch()
    scrollFunction()
}

function scrollSearch() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    $(".fixed_search").addClass("fixed_search_anim")
  } else {
    $(".fixed_search").removeClass("fixed_search_anim")
  }
}

function mediaCategory(x) {
  if (x.matches) {
    $(".category").hide()
  } else {
    $(".category").show()
  }
}
var category = window.matchMedia("(max-width:413px)")
mediaCategory(category)
category.addListener(mediaCategory)

function mediaSrch(x) {
  if (x.matches) {
    $(".srch-i").attr("placeholder", "Ara..")
  } else {
    $(".srch-i").attr("placeholder", "Kelime ara..")
  }
}
var srch = window.matchMedia("(max-width: 391px)")
mediaSrch(srch)
srch.addListener(mediaSrch)

$('p:contains(word)', document.body).each(function(){
  $(this).html($(this).html().replace(
        new RegExp(word, 'g'), '<span style="color:indianred; font-style:italic">'+ word +'</span>'
  ))
})

$(".srch-btn").click(function(e) {
    var input = $(this).prev().val().trim()
    if (input.length > 0) {
        window.location.pathname = "/sözlük/q=" + input + "/"
    }
})

$(".srch-i").keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which)
    if(keycode == '13'){
        $(".srch-btn").click()
    }
})

$(".fixed_search_btn").click(function(e){
    var input = $(this).parent().prev().val().trim()
    if (input.length > 0) {
        window.location.pathname = "/sözlük/q=" + input + "/"
    }
})

$(".fixed_search_input").keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which)
    if(keycode == '13'){
        $(".fixed_search_btn").click()
    }
})

$(".open-his").click(function() {
    $(".history-body").removeClass("d-none", 100)
    $(".history-body").toggle("slide", { direction: "left" }, 300)
})

$(".checkbox input:checkbox").click(function() {
    var limit = $(".checkbox input:checkbox:checked").length >= 3
    $(".checkbox input:checkbox").not(":checked").attr("disabled",limit)
})

$("#audio").click(function() {
    $("audio")[0].play()
})

$(".add-btn").click(function() {
    var tr_list = []
    var plus = $(".plus")
    var minus = $(".minus")
    var audio = $(".search-top audio").attr("src")
    var ths = $(this)
    var is_btn_add = ths.hasClass("word-add")

    $(":checked").each(function () {
        var value = $(this).attr("value").trim()
        tr_list.push(value)
    })

    if ( !(ths.hasClass("add-btn-modal")) ) {
        if ( !(tr_list.length) ) {
            tr_list = []
            $(".t-row").slice(0,3).each(function() {
                tr_list.push($(this).text().trim())
            })
        }
        $.ajax({
            type:"GET",
            url: "/word_cd",
            data:{
                "word_en": word,
                "tr": tr_list,
                "audio": audio,
                "is_btn_add": is_btn_add
            },
            success: function(data) {
                if (data.is_added) {
                    ths.toggleClass("word-add word-delete")
                    ths.css("background", "brown")
                    notifWordAdded()
                    addUnlWordPrgTrackerAjax()
                } else if (data.is_deleted) {
                    ths.toggleClass("word-delete word-add")
                    ths.css("background", "teal")
                    notifWordDeleted()
                    deleteUnlWordAjax()
                } else if (data.error_msg) {
                    stopNotif()
                    $(".notif").addClass("notif-show success").append(`<div class="notif-timer"></div>`).find("span").html(data.error_msg)
                    if (data.error_msg === "Kelime zaten eklenmiş") {
                        ths.toggleClass("word-add word-delete")
                        ths.css("background", "brown")
                    } else if (data.error_msg === "Kelime zaten silinmiş") {
                        ths.toggleClass("word-delete word-add")
                        ths.css("background", "teal")
                    }
                    notifHide()
                }
            },
            error: function() {
                notifAjaxError()
            }
        })
        tr_list.splice(0,tr_list.length)
    }
    else {
        $("#loginModal").modal()
    }
})
