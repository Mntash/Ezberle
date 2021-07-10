$(".register").click(function(){
    $("#loginModal").modal()
})

window.onscroll = function() {scrollFixedSearch()}
function scrollFixedSearch() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    $(".scroll_top").css("display", "block")
    $(".fixed_search").addClass("fixed_search_anim")
  } else {
    $(".scroll_top").css("display", "none")
    $(".fixed_search").removeClass("fixed_search_anim")
  }
}

$(".fixed_search_btn").click(function(e){
    var input = $(this).parent().prev().val().trim()
    if (input.length > 0) {
        window.location.pathname = "/sözlük/q=" + input + "/"
    } else if (input==="") {
        e.preventDefault()
    }
})

$(".fixed_search_input").keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which)
    if(keycode == '13'){
        $(".fixed_search_btn").click()
    }
})

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

function mediaContainer(container) {
  if (!(container.matches)) {
    $(".container-media").removeClass("container")
  } else if (!($(".container-media").hasClass("container"))) {
    $(".container-media").addClass("container")
  }
}
var container = window.matchMedia("(min-width:576px)")
mediaContainer(container)
container.addListener(mediaContainer)

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

$(".srch-i").keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which)
    if(keycode == '13'){
        $(".srch-btn").click()
    }
})

$('p:contains("{{word}}")', document.body).each(function(){
  $(this).html($(this).html().replace(
        new RegExp("{{word}}", 'g'), '<span style="color:indianred; font-style:italic">'+ "{{word}}" +'</span>'
  ))
})

$(".srch-btn").click(function(e) {
    var input = $(this).prev().val().trim()
    if (input.length > 0) {
        window.location.pathname = "/sözlük/q=" + input + "/"
    } else if (input==="") {
        e.preventDefault()
    }
})

$(".open-his").click(function(event) {
    event.preventDefault(event)
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

var tr_list = []

$(".add-btn").click(function() {
    var plus = $(".plus")
    var minus = $(".minus")
    var audio = $("audio").attr("src")
    var ths = $(this)
    $(":checked").each(function () {
        var value = $(this).attr("value").trim()
        tr_list.push(value)
    })

    if ( !(ths.hasClass("add-btn-modal")) ) {
        if (ths.hasClass('change')) {
            ths.removeClass("change")
            ths.css("background", "teal")
        }
        else {
            ths.addClass("change")
            ths.css("background", "brown")
        }

        if (tr_list.length === 0) {
            tr_first = []
            tr_first.push($("#tr-first").first().text().trim())

            $.ajax({
                     type:"GET",
                     url: "/word_cd",
                     data:{
                        "word_en": word,
                        "tr": tr_first,
                        "audio": audio
                     },
                     success: function(data) {
                        if (data.is_added) {
                            stopNotif()
                            $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html("Kelime eklendi!")
                            notifHide()
                            $.ajax({
                                type:"GET",
                                url: "/prg_tracker/",
                                data:{
                                   "ach_no": [2, 8],
                                   "up_or_down": 1,
                                }
                            })
                        } else if (data.is_deleted) {
                            stopNotif()
                            $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html("Kelime silindi!")
                            notifHide()
                            $.ajax({
                                type:"GET",
                                url: "/prg_tracker/",
                                data:{
                                   "ach_no": [2, 8],
                                   "up_or_down": 0,
                                }
                            })
                        }
                     }
                  })
            tr_list.splice(0,tr_list.length)

        } else {
            $.ajax({
                 type:"GET",
                 url: "/word_cd",
                 data:{
                    "word_en": word,
                    "tr": tr_list,
                    "audio": audio
                 },
                 success: function(data) {
                    if (data.is_added) {
                        stopNotif()
                        $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html("Kelime eklendi!")
                        notifHide()
                        $.ajax({
                            type:"GET",
                            url: "/prg_tracker/",
                            data:{
                               "ach_no": [2, 8],
                               "up_or_down": 1,
                            }
                        })
                    } else if (data.is_deleted) {
                        stopNotif()
                        $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html("Kelime silindi!")
                        notifHide()
                        $.ajax({
                            type:"GET",
                            url: "/prg_tracker/",
                            data:{
                               "ach_no": [2, 8],
                               "up_or_down": 0,
                            }
                        })
                    }
                 }
            })
            tr_list.splice(0,tr_list.length)
        }
    }
    else {
        $("#loginModal").modal()
    }
})

var timeoutId;

function notifHide() {
    timeoutId = setTimeout(function(){
        $(".notif").removeClass("notif-show").find("div").remove()
    }, 3000)
}

function stopNotif() {
    $(document).find(".notif-timer").remove()
    clearTimeout(timeoutId)
}