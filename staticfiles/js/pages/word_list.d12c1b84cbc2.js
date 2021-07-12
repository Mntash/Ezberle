$("#show-fav").click(function(){
    if ($(this).is(':checked')) {
        window.location.pathname = "/kelime_listesi/q=$favorites"
    } else {
        window.location.pathname = "/kelime_listesi/"
    }
})

$(".times-err").click(function() {
    $(".err-mng").addClass("d-none")
})

$("input[type='reset']").click(function(e){
    e.preventDefault()
    if ($(this).hasClass("reset-unl")) {
        $("input[name='english-unl']").val("")
        $("input[name='turkish-unl']").each(function () {
            $(this).val("")
        })
    } else if ($(this).hasClass("reset-l")) {
        $("input[name='english-l']").val("")
        $("input[name='turkish-l']").each(function () {
            $(this).val("")
        })
    }
})

$("input[type='submit']").click(function(e){
e.preventDefault()
var tr_list = []
    if ($(this).hasClass("add2unl")) {
        var en = $("input[name='english-unl']").val()
        $("input[name='turkish-unl']").each(function() {
            var value = $(this).val().trim()
            if ( !(value==="") ) {
                tr_list.push(value)
            }
        })
        if ( en.length > 1 ) {
            if (tr_list.length > 0) {
               $.ajax({
                    type:"POST",
                    url: "/kelime_listesi/",
                    data: {
                        'english-unl': en,
                        'turkish-unl': tr_list,
                        "csrfmiddlewaretoken" : csrf_token
                    },
                    dataType: 'json',
                    success: function(data) {
                        if (data.is_added) {
                            window.location.pathname = "/kelime_listesi/"
                        } else {
                            $(".err-msg").html("Bu kelime zaten kayıtlı.")
                            $("#add-title-unl").before($("#err-mng"))
                            $(".err-mng").removeClass("d-none")
                        }
                        $.ajax({
                            type:"GET",
                            url: "/prg_tracker/",
                            data:{
                               "ach_no": [2, 8],
                               "up_or_down": 1,
                            }
                        })
                    }
               })
            } else {
                $(".err-msg").html("En az 1 tane Türkçe kelime ekleyin.")
                $("#add-title-unl").before($("#err-mng"))
                $(".err-mng").removeClass("d-none")
            }
        } else {
            $(".err-msg").html("Minimum 2 harfli bir kelime girin.")
            $("#add-title-unl").before($("#err-mng"))
            $(".err-mng").removeClass("d-none")
        }
    } else if ($(this).hasClass("add2l")) {
        var en = $("input[name='english-l']").val()
        $("input[name='turkish-l']").each(function() {
            var value = $(this).val().trim()
            if ( !(value==="") ) {
                tr_list.push(value)
            }
        })
        if ( en.length > 1 ) {
            if (tr_list.length > 0) {
                $.ajax({
                    type:"POST",
                    url: "/kelime_listesi/",
                    data: {
                        'english-l': en,
                        'turkish-l': tr_list,
                        "csrfmiddlewaretoken" : csrf_token
                    },
                    dataType: 'json',
                    success: function(data) {
                        if (data.is_added) {
                            window.location.pathname = "/kelime_listesi/"
                        } else {
                            $(".err-msg").html("Bu kelime zaten kayıtlı.")
                            $("#add-title-l").before($("#err-mng"))
                            $(".err-mng").removeClass("d-none")
                        }
                        $.ajax({
                            type:"GET",
                            url: "/prg_tracker/",
                            data:{
                               "ach_no": [1, 5],
                               "up_or_down": 1,
                            }
                        })
                    }
                })
            } else {
                $(".err-msg").html("En az 1 tane Türkçe kelime ekleyin.")
                $("#add-title-l").before($("#err-mng"))
                $(".err-mng").removeClass("d-none")
            }
        } else {
            $(".err-msg").html("Minimum 2 harfli bir kelime girin.")
            $("#add-title-l").before($("#err-mng"))
            $(".err-mng").removeClass("d-none")
        }
    }
})

function mediaContainer(x) {
  if (x.matches) {
    $(".word-mng").addClass("container")
  } else {
    $(".word-mng").removeClass("container")
  }
}
var container = window.matchMedia("(min-width:576px) and (max-width:992px)")
mediaContainer(container)
container.addListener(mediaContainer)


$("input[name='turkish-unl']").keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which)
    if(keycode == '13'){
        $(".add2unl").click()
    }
})

$("input[name='turkish-l']").keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which)
    if(keycode == '13'){
        $(".add2l").click()
    }
})

$(".srch-i").autocomplete({
    source: function(request, response) {
        $.getJSON("kelime_listesi/ajax_search/", { q: request.term }, response)
    },
    minLength: 2,
    select: function( event, ui ) {
         window.location.pathname = "/kelime_listesi/q=" + ui.item.label + "/"
    }
})

$(".srch-i").keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which)
    if(keycode == '13'){
        $(".srch-btn").click()
    }
})

$(".srch-btn").click(function(e) {
    e.preventDefault()
    var value = $(this).prev().val()
    if (value.length > 0) {
        window.location.pathname = "/kelime_listesi/q=" + value + "/"
    } else {
        window.location.pathname = "/kelime_listesi/"
    }
})

$(".fas").hover(function() {
  $(this).next().toggle()
})

var tr_count_unl = 0
var tr_count_l = 0

$(".add-tr").click(function() {
    event.preventDefault()
    if ($(this).hasClass("add-tr-unl")) {
      if (tr_count_unl === 0) {
          $(".input-tr-unl").parent().after('<div><input type="text" name="turkish-unl" class="mt-1 tr-2-unl w-75" autocomplete="off"></div>')
          $(".tr-2-unl").hide().fadeIn().focus()
          $(".del-tr-unl").removeClass("d-none")
          tr_count_unl++
      } else if (tr_count_unl === 1) {
          $(".tr-2-unl").parent().after('<div><input type="text" name="turkish-unl" class="mt-1 tr-3-unl w-75" autocomplete="off"></div>')
          $(".tr-3-unl").hide().fadeIn().focus()
          $(this).prop("disabled", "true").addClass("not-allowed")
          tr_count_unl++
      }
    }
    else if ($(this).hasClass("add-tr-l")) {
      if (tr_count_l === 0) {
          $(".input-tr-l").parent().after('<div><input type="text" name="turkish-l" class="mt-1 tr-2-l w-75" autocomplete="off"></div>')
          $(".tr-2-l").hide().fadeIn().focus()
          $(".del-tr-l").removeClass("d-none")
          tr_count_l++
      } else if (tr_count_l === 1) {
          $(".tr-2-l").parent().after('<div><input type="text" name="turkish-l" class="mt-1 tr-3-l w-75" autocomplete="off"></div>')
          $(".tr-3-l").hide().fadeIn().focus()
          $(this).prop("disabled", "true").addClass("not-allowed")
          tr_count_l++
      }
    }
})

$(".del-tr").click(function(){
    event.preventDefault()
    if ($(this).hasClass("del-tr-unl")) {
      if (tr_count_unl === 2) {
          $(".add-tr-unl").removeAttr("disabled").removeClass("not-allowed")
          $(this).parent().prev().remove()
          tr_count_unl -= 1
      } else if (tr_count_unl === 1) {
          $(this).parent().prev().remove()
          $(this).addClass("d-none")
          $(".add-tr-unl").css("margin-left", "7px")
          tr_count_unl -= 1
      }
    }
    else if ($(this).hasClass("del-tr-l")) {
      if (tr_count_l === 2) {
          $(".add-tr-l").removeAttr("disabled").removeClass("not-allowed")
          $(this).parent().prev().remove()
          tr_count_l -= 1
      } else if (tr_count_l === 1) {
          $(this).parent().prev().remove()
          $(this).addClass("d-none")
          $(".add-tr-l").css("margin-left", "7px")
          tr_count_l -= 1
      }
    }
})

$(document).on("click", ".tick-seen", function(){
    var ths = $(this)
    var wordId = ths.parent().attr('data-id')
    if (ths.hasClass("cadet")) {
        $.ajax({
            type:"GET",
            url: "/word_is_seen/",
            data: {
                'id': wordId,
                'seen': 'seen'
            },
            dataType: 'json',
            success: function (data) {
                if (data.is_seen) {
                    ths.removeClass("cadet")
                    ths.addClass("dodger")
                }
            }
        })
    } else if (ths.hasClass("dodger")) {
        $.ajax({
            type:"GET",
            url: "/word_is_seen/",
            data: {
                'id': wordId,
                'seen': 'seen'
            },
            dataType: 'json',
            success: function (data) {
                if (!(data.is_seen)) {
                    ths.removeClass("dodger")
                    ths.addClass("cadet")
                }
            }
        })
    }
})

$(document).on("click", ".memorize", function(){
    var ths = $(this)
    var wordId = ths.parent().attr("data-id")

    if (ths.hasClass("tick-learn")) {
        $.ajax({
            type:"GET",
            url: "/word_is_learned/",
            data: {
                'id': wordId,
                'learned': 'learned'
            },
            dataType: 'json',
            success: function (data) {
                count_unl -= 1
                count_l += 1
                $(".count-unl").html(count_unl)
                $(".count-l").html(count_l)
                if (data.is_learned) {
                    var data_obj = data["word"]
                    var list = $(".li" + wordId)
                    var l_word = $(".l-word")
                    var word_count = data["word_count"]["count"]
                    if ($(".l-word > li").length >= 10) {
                        $(".l-word > li:last-child").remove()
                        list.prependTo(l_word).addClass("word-memo")
                        setTimeout(function(){
                            list.removeClass("word-memo")
                        }, 700)
                    } else {
                        list.prependTo(l_word).addClass("word-memo")
                        setTimeout(function(){
                            list.removeClass("word-memo")
                        }, 700)
                    }
                    if (word_count >= 10) {
                        var obj_eng = data_obj["english"]
                        var obj_id = data_obj["id"]
                        var tr_list = data_obj["tr_list"]
                        $(".unl-word").append(`
                        <li data-id="${obj_id}" class="li${obj_id}">
                            <div class="en-section d-flex justify-content-between">
                                <div class="align-self-center word">
                                    <a href="/sözlük/q=${obj_eng}">${obj_eng}</a>
                                </div>
                                <div data-id="${obj_id}" class="btn-grp">
                                    <i title="" class="material-icons audio"></i>
                                    <audio src=""></audio>
                                    <i title="Görüldü" class="material-icons tick-seen">done_all</i>
                                    <i title="Ezberledim" class="material-icons tick-learn memorize">check_box</i>
                                    <i data-toggle="collapse" data-target=".tr${obj_id}" title="Türkçelerini göster"
                                       class="material-icons eye">remove_red_eye</i>
                                    <i title="" class="material-icons star"></i>
                                    <i title="Sil" class="material-icons del del-unl">delete</i>
                                </div>
                            </div>
                            <div class="tr-section collapse tr${obj_id}">
                                <div>
                                  <span></span>
                                </div>
                                <ul></ul>
                            </div>
                        </li>`)
                        if (tr_list) {
                            if (tr_list.length == 1) {
                                $(".unl-word .tr${obj_id} span").html("Türkçesi:")
                                $(".unl-word .tr${obj_id} ul").append(`<li>${tr_list[0]}</li>`)
                            } else {
                                $(".unl-word .tr${obj_id} span").html("Türkçeleri:")
                                tr_list.map(function(obj){
                                    $(".unl-word .tr${obj_id} ul").append(`<li>${obj}</li>`)
                                })
                            }
                        } else {
                            $(".unl-word .tr${obj_id} ul").append(`
                            <div>
                                <strong>&#8722;</strong><span>Bu kelimeye Türkçe eklenmemiş</span><strong>&#8722;</strong>
                            </div>`)
                        }
                        if (data_obj["audio"]) {
                            $(`[data-id=${obj_id}] i.audio`).attr("title", "Dinle").html("volume_up")
                            $(`[data-id=${obj_id}] audio`).attr("src", `${data_obj["audio"]}`)
                        } else {
                            $(`[data-id=${obj_id}] i.audio`).attr("title", "Ses mevcut değil").html("volume_off")
                        }
                        if (data_obj["is_seen"]) {
                            $(`[data-id=${obj_id}] i.tick-seen`).addClass("dodger")
                        } else {
                            $(`[data-id=${obj_id}] i.tick-seen`).addClass("cadet")
                        }
                        if (!(data_obj["is_starred"])) {
                            $(`[data-id=${obj_id}] i.star`).attr("title", "Favorilere ekle").html("star_border")
                        } else {
                            $(`[data-id=${obj_id}] i.star`).attr("title", "Favorilere eklendi").addClass("pale-yellow").html("star")
                        }
                    }
                    ths.html("undo")
                    ths.toggleClass("tick-learn tick-unlearn")
                    ths.siblings().last().children().first().toggleClass("del-unl del-l")
                }
                $.ajax({
                    type:"GET",
                    url: "/prg_tracker/",
                    data:{
                       "ach_no": [1, 5],
                       "up_or_down": 1,
                    }
                })
            }
        })
    } else if (ths.hasClass("tick-unlearn")) {
        $.ajax({
            type:"GET",
            url: "/word_is_learned/",
            data: {
                'id': wordId,
                'unlearned': 'unlearned'
            },
            dataType: 'json',
            success: function (data) {
                count_unl += 1
                count_l -= 1
                $(".count-unl").html(count_unl)
                $(".count-l").html(count_l)
                if (!(data.is_learned)) {
                    var data_obj = data["word"]
                    var list = $(".li" + wordId)
                    var unl_word = $(".unl-word")
                    var word_count = data["word_count"]["count"]
                    if ($(".unl-word > li").length >= 10) {
                        $(".unl-word > li:last-child").remove()
                        list.prependTo(unl_word).addClass("word-memo")
                        setTimeout(function(){
                            list.removeClass("word-memo")
                        }, 700)
                    } else {
                        list.prependTo(unl_word).addClass("word-memo")
                        setTimeout(function(){
                            list.removeClass("word-memo")
                        }, 700)
                    }
                    if (word_count >= 10) {
                        var obj_eng = data_obj["english"]
                        var obj_id = data_obj["id"]
                        var tr_list = data_obj["tr_list"]
                        $(".l-word").append(`
                        <li data-id="${obj_id}" class="li${obj_id}">
                            <div class="en-section d-flex justify-content-between">
                                <div class="align-self-center word">
                                    <a href="/sözlük/q=${obj_eng}">${obj_eng}</a>
                                </div>
                                <div data-id="${obj_id}" class="btn-grp">
                                    <i title="" class="material-icons audio"></i>
                                    <audio src=""></audio>
                                    <i title="Görüldü" class="material-icons tick-seen">done_all</i>
                                    <i title="Ezberledim" class="material-icons tick-learn memorize">undo</i>
                                    <i data-toggle="collapse" data-target=".tr${obj_id}" title="Türkçelerini göster"
                                       class="material-icons eye">remove_red_eye</i>
                                    <i title="" class="material-icons star"></i>
                                    <i title="Sil" class="material-icons del del-l">delete</i>
                                </div>
                            </div>
                            <div class="tr-section collapse tr${obj_id}">
                                <div>
                                  <span></span>
                                </div>
                                <ul></ul>
                            </div>
                        </li>`)
                        if (tr_list) {
                            if (tr_list.length == 1) {
                                $(".l-word .tr${obj_id} span").html("Türkçesi:")
                                $(".l-word .tr${obj_id} ul").append(`<li>${tr_list[0]}</li>`)
                            } else {
                                $(".l-word .tr${obj_id} span").html("Türkçeleri:")
                                tr_list.map(function(obj){
                                    $(".l-word .tr${obj_id} ul").append(`<li>${obj}</li>`)
                                })
                            }
                        } else {
                            $(".l-word .tr${obj_id} ul").append(`
                            <div>
                                <strong>&#8722;</strong><span>Bu kelimeye Türkçe eklenmemiş</span><strong>&#8722;</strong>
                            </div>`)
                        }
                        if (data_obj["audio"]) {
                            $(`[data-id=${obj_id}] i.audio`).attr("title", "Dinle").html("volume_up")
                            $(`[data-id=${obj_id}] audio`).attr("src", `${data_obj["audio"]}`)
                        } else {
                            $(`[data-id=${obj_id}] i.audio`).attr("title", "Ses mevcut değil").html("volume_off")
                        }
                        if (data_obj["is_seen"]) {
                            $(`[data-id=${obj_id}] i.tick-seen`).addClass("dodger")
                        } else {
                            $(`[data-id=${obj_id}] i.tick-seen`).addClass("cadet")
                        }
                        if (!(data_obj["is_starred"])) {
                            $(`[data-id=${obj_id}] i.star`).attr("title", "Favorilere ekle").html("star_border")
                        } else {
                            $(`[data-id=${obj_id}] i.star`).attr("title", "Favorilere eklendi").addClass("pale-yellow").html("star")
                        }
                    }
                    ths.html("check_box").toggleClass("tick-unlearn tick-learn")
                    ths.siblings().last().children().first().toggleClass("del-l del-unl")
                }
            }
        })
    } // end else if
})

$(document).on("click", ".star", function(){
    var ths = $(this)
    var wordId = ths.parent().attr('data-id')

    if (ths.html() == "star_border") {
        $.ajax({
            type:"GET",
            url: "/word_is_starred/",
            data: {
                'id': wordId,
                'starred': 'starred'
            },
            dataType: 'json',
            success: function (data) {
                if (data.is_starred) {
                    ths.html("star").addClass("pale-yellow")
                }
            }
        })
    } else if (ths.html() == "star") {
        $.ajax({
            type:"GET",
            url: "/word_is_starred/",
            data: {
                'id': wordId,
                'starred': 'starred'
            },
            dataType: 'json',
            success: function (data) {
                if (!(data.is_starred)) {
                    ths.html("star_border").removeClass("pale-yellow")
                }
            }
        })
    }
})

$(document).on("click", ".del", function(){
    var wordId = $(this).parent().attr('data-id')
    if ($(this).hasClass("del-unl")) {
        $.ajax({
            type:"GET",
            url: "/crud/delete/",
            data: {
                'id': wordId,
                'delete': 'delete',
                'del_unlearned': 'unlearned'
            },
            dataType: 'json',
            success: function(data) {
                $(".li" + wordId).remove()
                count_unl -= 1
                $(".count-unl").html(count_unl)
                stopNotif()
                $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html("Kelime silindi!")
                notifHide()
                var data_obj = data["word"]
                var list = $(".li" + wordId)
                var unl_word = $(".unl-word")
                var word_count = data["word_count"]["count"]
                if (word_count >= 10) {
                    var obj_eng = data_obj["english"]
                    var obj_id = data_obj["id"]
                    var tr_list = data_obj["tr_list"]
                    $(".unl-word").append(`
                    <li data-id="${obj_id}" class="li${obj_id}">
                        <div class="en-section d-flex justify-content-between">
                            <div class="align-self-center word">
                                <a href="/sözlük/q=${obj_eng}">${obj_eng}</a>
                            </div>
                            <div data-id="${obj_id}" class="btn-grp">
                                <i title="" class="material-icons audio"></i>
                                <audio src=""></audio>
                                <i title="Görüldü" class="material-icons tick-seen">done_all</i>
                                <i title="Ezberledim" class="material-icons tick-learn memorize">check_box</i>
                                <i data-toggle="collapse" data-target=".tr${obj_id}" title="Türkçelerini göster"
                                   class="material-icons eye">remove_red_eye</i>
                                <i title="" class="material-icons star"></i>
                                <i title="Sil" class="material-icons del del-unl">delete</i>
                            </div>
                        </div>
                        <div class="tr-section collapse tr${obj_id}">
                            <div>
                              <span></span>
                            </div>
                            <ul></ul>
                        </div>
                    </li>`)
                    if (tr_list) {
                        if (tr_list.length == 1) {
                            $(".tr-section div span").html("Türkçesi:")
                            $(".tr-section ul").append(`<li>${tr_list[0]}</li>`)
                        } else {
                            $(".tr-section div span").html("Türkçeleri:")
                            tr_list.map(function(obj){
                                $(".tr-section ul").append(`<li>${obj}</li>`)
                            })
                        }
                    } else {
                        $(".tr-section ul").append(`
                        <div>
                            <strong>&#8722;</strong><span>Bu kelimeye Türkçe eklenmemiş</span><strong>&#8722;</strong>
                        </div>`)
                    }
                    if (data_obj["audio"]) {
                        $(`[data-id=${obj_id}] i.audio`).attr("title", "Dinle").html("volume_up")
                        $(`[data-id=${obj_id}] audio`).attr("src", `${data_obj["audio"]}`)
                    } else {
                        $(`[data-id=${obj_id}] i.audio`).attr("title", "Ses mevcut değil").html("volume_off")
                    }
                    if (data_obj["is_seen"]) {
                        $(`[data-id=${obj_id}] i.tick-seen`).addClass("dodger")
                    } else {
                        $(`[data-id=${obj_id}] i.tick-seen`).addClass("cadet")
                    }
                    if (!(data_obj["is_starred"])) {
                        $(`[data-id=${obj_id}] i.star`).attr("title", "Favorilere ekle").html("star_border")
                    } else {
                        $(`[data-id=${obj_id}] i.star`).attr("title", "Favorilere eklendi").addClass("pale-yellow").html("star")
                    }
                }
            }
        })
    } else {
        $.ajax({
            type:"GET",
            url: "/crud/delete/",
            data: {
                'id': wordId,
                'delete': 'delete',
                'del_learned': 'learned'
            },
            dataType: 'json',
            success: function(data) {
                $(".li" + wordId).remove()
                count_l -= 1
                $(".count-l").html(count_l)
                stopNotif()
                $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html("Kelime silindi!")
                notifHide()
                var data_obj = data["word"]
                var list = $(".li" + wordId)
                var unl_word = $(".unl-word")
                var word_count = data["word_count"]["count"]
                if (word_count >= 10) {
                    var obj_eng = data_obj["english"]
                    var obj_id = data_obj["id"]
                    var tr_list = data_obj["tr_list"]
                    $(".l-word").append(`
                    <li data-id="${obj_id}" class="li${obj_id}">
                        <div class="en-section d-flex justify-content-between">
                            <div class="align-self-center word">
                                <a href="/sözlük/q=${obj_eng}">${obj_eng}</a>
                            </div>
                            <div data-id="${obj_id}" class="btn-grp">
                                <i title="" class="material-icons audio"></i>
                                <audio src=""></audio>
                                <i title="Görüldü" class="material-icons tick-seen">done_all</i>
                                <i title="Ezberledim" class="material-icons tick-learn memorize">undo</i>
                                <i data-toggle="collapse" data-target=".tr${obj_id}" title="Türkçelerini göster"
                                   class="material-icons eye">remove_red_eye</i>
                                <i title="" class="material-icons star"></i>
                                <i title="Sil" class="material-icons del del-l">delete</i>
                            </div>
                        </div>
                        <div class="tr-section collapse tr${obj_id}">
                            <div>
                              <span></span>
                            </div>
                            <ul></ul>
                        </div>
                    </li>`)
                    if (tr_list) {
                        if (tr_list.length == 1) {
                            $(".tr-section div span").html("Türkçesi:")
                            $(".tr-section ul").append(`<li>${tr_list[0]}</li>`)
                        } else {
                            $(".tr-section div span").html("Türkçeleri:")
                            tr_list.map(function(obj){
                                $(".tr-section ul").append(`<li>${obj}</li>`)
                            })
                        }
                    } else {
                        $(".tr-section ul").append(`
                        <div>
                            <strong>&#8722;</strong><span>Bu kelimeye Türkçe eklenmemiş</span><strong>&#8722;</strong>
                        </div>`)
                    }
                    if (data_obj["audio"]) {
                        $(`[data-id=${obj_id}] i.audio`).attr("title", "Dinle").html("volume_up")
                        $(`[data-id=${obj_id}] audio`).attr("src", `${data_obj["audio"]}`)
                    } else {
                        $(`[data-id=${obj_id}] i.audio`).attr("title", "Ses mevcut değil").html("volume_off")
                    }
                    if (data_obj["is_seen"]) {
                        $(`[data-id=${obj_id}] i.tick-seen`).addClass("dodger")
                    } else {
                        $(`[data-id=${obj_id}] i.tick-seen`).addClass("cadet")
                    }
                    if (!(data_obj["is_starred"])) {
                        $(`[data-id=${obj_id}] i.star`).attr("title", "Favorilere ekle").html("star_border")
                    } else {
                        $(`[data-id=${obj_id}] i.star`).attr("title", "Favorilere eklendi").addClass("pale-yellow").html("star")
                    }
                }
            }
        })
    }
})

$(document).on("click", "i.audio", function(){
    $(this).next()[0].play()
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