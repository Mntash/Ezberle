$("input[type='submit']").click(function(e){
    e.preventDefault()
    var tr_list = []
    var type = $(this).hasClass("add_word_l") ? "l" : "unl"
    var type_bool = (type=="l") ? true : false
    var word = $(`input[name='english-${type}']`).val()

    $(`input[name='turkish-${type}']`).each(function() {
        var value = $(this).val().trim()
        if ( !(value==="") ) {
            tr_list.push(value)
        }
    })
    if ( word.length > 1 ) {
        if (tr_list.length > 0) {
           $.ajax({
                type:"GET",
                url: "/word_cd",
                data: {
                    "word_en": word,
                    "tr": tr_list,
                    "audio": "",
                    "is_btn_add": true,
                    "word_list": 1,
                    "type": type_bool
                },
                dataType: 'json',
                success: function(data) {
                    if (data.is_added) {
                        var obj_id = data.id
                        notifWordAdded()
                        var return_list = ajaxAddOrFetchWord("manual_add", data, type, obj_id, false)
                        pagination("add", return_list[1], type)
                    } else {
                        $(".err-msg").html("Bu kelime zaten kayıtlı.")
                        $(`#add-title-${type}`).before($("#err-mng"))
                        $(".err-mng").removeClass("d-none")
                    }
                },
                error: function() {
                    notifAjaxError()
                }
           })
        } else {
            $(".err-msg").html("En az 1 tane Türkçe kelime ekleyin.")
            $(`#add-title-${type}`).before($("#err-mng"))
            $(".err-mng").removeClass("d-none")
        }
    } else {
        $(".err-msg").html("Minimum 2 harfli bir kelime girin.")
        $(`#add-title-${type}`).before($("#err-mng"))
        $(".err-mng").removeClass("d-none")
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

$(document).on("keypress", ".keycode-input", function(event) {
    var keycode = (event.keyCode ? event.keyCode : event.which)
    if(keycode == '13'){
        $(this).parent().parent().find("input[value='Ekle']").click()
    }
})

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
    $(this).parent().parent().find("input[type='text']").each(function(){
        $(this).val("")
    })
})

$(".srch-i").keyup(function() {
    var search = $(this).val()
    $.ajax({
        type:"GET",
        url: "/word_list_ajax_search/",
        data:{
            "search": search
        },
        success: function(data) {
            data_obj_list = data.obj_list
            $(".unl-word").empty()
            $(".l-word").empty()
            data_obj_list.map(function(e){
                var type = (e.is_learned) ? "l" : "unl"
                var obj_id = e.id
                ajaxAddOrFetchWord("search", e, type, obj_id, false)
            })

        }
    })
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

$(".fa-question-circle").hover(function() {
  $(this).next().toggle()
})

var tr_count_unl = 0
var tr_count_l = 0

$(".add-tr").click(function() {
    event.preventDefault()
    var type = ($(this).hasClass("add-tr-unl")) ? "unl" : "l"
    var ths = $(this)

    function addFirstInputTr(type) {
        $(`.input-tr-${type}`).parent().after(`<div><input type="text" class="mt-1 tr-2-${type} w-75 keycode-input" autocomplete="off"></div>`)
        $(`.tr-2-${type}`).hide().fadeIn().focus()
        $(`.del-tr-${type}`).removeClass("d-none")
    }

    function addSecondInputTr(type) {
        $(`.tr-2-${type}`).parent().after(`<div><input type="text" class="mt-1 tr-3-${type} w-75 keycode-input" autocomplete="off"></div>`)
        $(`.tr-3-${type}`).hide().fadeIn().focus()
        ths.prop("disabled", "true").addClass("not-allowed")
    }

    if (type==="unl") {
        if (tr_count_unl === 0) {
            addFirstInputTr(type)
            tr_count_unl++
        } else if (tr_count_unl === 1) {
            addSecondInputTr(type)
            tr_count_unl++
        }
    } else if ($(this).hasClass("add-tr-l")) {
        if (tr_count_l === 0) {
            addFirstInputTr(type)
            tr_count_l++
        } else if (tr_count_l === 1) {
            addSecondInputTr(type)
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

$(document).on("click", ".check-seen", function(){
    var ths = $(this)
    var wordId = ths.parent().attr('data-id')
    $.ajax({
        type:"GET",
        url: "/word_is_seen/",
        data: {
            'id': wordId,
            'is_seen': 1
        },
        dataType: 'json',
        success: function (data) {
            if (data.is_seen) {
                ths.removeClass("word-unseen")
                ths.addClass("word-seen")
            } else {
                ths.removeClass("word-seen")
                ths.addClass("word-unseen")
            }
        },
        error: function() {
            notifAjaxError()
        }
    })
})

$(document).on("click", ".memorize", function(){
    var ths = $(this)
    var wordId = ths.parent().attr("data-id")
    var type = (ths.hasClass("check-unlearn")) ? "l" : "unl"
    var other_type = (type==="unl") ? "l" : "unl"
    var word_no = parseInt($(`.pagination-${type} .active span`).text())
    var is_last_page = ($(`.pagination-${type} .page-item`).eq(-2).hasClass("active")) ? true : false

    $.ajax({
        type:"GET",
        url: "/word_is_learned/",
        data: {
            'id': wordId,
            'get_nth_word': word_no,
            'is_last_page': is_last_page,
            [`memo-${other_type}`]: 1
        },
        dataType: 'json',
        success: function (data) {
            return_list = ajaxAddOrFetchWord("memorize", data, type, wordId, is_last_page)
            pagination("delete", return_list[1], type)
            pagination("add", return_list[2], other_type)
            if ( $(`.pagination-${other_type} .page-item`).eq(1).hasClass("active") ) {
                if ($(`.${other_type}-word > li`).length >= 10) {
                    $(`.${other_type}-word > li:last-child`).remove()
                }
                return_list[0].prependTo($(`.${other_type}-word`)).addClass("word-memo")
                setTimeout(function(){
                    return_list[0].removeClass("word-memo")
                }, 700)
            } else {
                return_list[0].remove()
            }
        },
        error: function() {
            notifAjaxError()
        }
    })
})

$(document).on("click", ".star", function(){
    var ths = $(this)
    var wordId = ths.parent().attr('data-id')
    $.ajax({
        type:"GET",
        url: "/word_is_starred/",
        data: {
            'id': wordId,
            'star': 1
        },
        dataType: 'json',
        success: function (data) {
            if (data.is_starred) {
                ths.html("star").addClass("pale-yellow")
            } else {
                ths.html("star_border").removeClass("pale-yellow")
            }
        },
        error: function() {
            notifAjaxError()
        }
    })
})

$(document).on("click", ".del", function(){
    var wordId = $(this).parent().attr('data-id')
    var type = ($(this).parent().hasClass("btn-grp-unl")) ? "unl" : "l"
    var word_no = parseInt($(`.pagination-${type} .active span`).text())
    var is_last_page = ($(`.pagination-${type} .page-item`).eq(-2).hasClass("active")) ? true : false
    $.ajax({
        type:"GET",
        url: "/crud/delete/",
        data: {
            'id': wordId,
            'delete': 'delete',
            'get_nth_word': word_no,
            'is_last_page': is_last_page,
            [`del_${type}`]: 1
        },
        dataType: 'json',
        success: function(data) {
            notifWordDeleted()
            return_list = ajaxAddOrFetchWord("delete", data, type, wordId, is_last_page)
            return_list[0].remove()
            pagination("delete", return_list[1], type)
        },
        error: function() {
            notifAjaxError()
        }
    })
})

$(document).on("click", "i.audio", function(){
    $(this).next()[0].play()
})

function ajaxAddOrFetchWord(purpose, data, type, wordId, del_is_last_page) {
    if (purpose=="delete" || purpose=="memorize" ) {
        var data_obj = data["word"]
        var word_count = data["word_count"]["count"]
    } else if (purpose=="search" || purpose=="manual_add") {
        var data_obj = data
    }
    var other_type = (type==="unl") ? "l" : "unl"
    var memo_class = (type==="unl") ? "check-learn" : "check-unlearn"
    var i_title = (type==="unl") ? "Ezberledim" : "Unuttum"
    var memo_icon = (type==="unl") ? "check_box" : "undo"
    var list_el = $(".li" + wordId)
        if ( !($(".srch-i").val().length > 0) || purpose=="search" ) {
            if (word_count >= 10 || purpose=="search" || purpose=="manual_add") {
                if (!(del_is_last_page)) {
                    var obj_eng = data_obj["english"]
                    var obj_id = data_obj["id"]
                    var tr_list = data_obj["tr_list"]
                    var obj_audio = data_obj["audio"]
                    var obj_is_seen = data_obj["is_seen"]
                    var obj_is_starred = data_obj["is_starred"]
                    var result = `<li data-id="${obj_id}" class="li${obj_id}">
                            <div class="en-section d-flex justify-content-between">
                                <div class="align-self-center word">
                                    <a href="/sözlük/q=${obj_eng}">${obj_eng}</a>
                                </div>
                                <div data-id="${obj_id}" class="btn-grp btn-grp-${type}">
                                    <i title="" class="material-icons audio"></i>
                                    <audio src=""></audio>
                                    <i title="" class="material-icons check-seen">done_all</i>
                                    <i title="${i_title}" class="material-icons ${memo_class} memorize">${memo_icon}</i>
                                    <i data-toggle="collapse" data-target=".tr${obj_id}" title="Türkçelerini göster"
                                       class="material-icons eye">remove_red_eye</i>
                                    <i title="" class="material-icons star"></i>
                                    <i title="Sil" class="material-icons del">delete</i>
                                </div>
                            </div>
                            <div class="tr-section collapse tr${obj_id}">
                                <div>
                                  <span></span>
                                </div>
                                <ul></ul>
                            </div>
                        </li>`
                }
                if (purpose=="manual_add") {
                    if ( $(`.pagination-${type} .page-item`).eq(1).hasClass("active") ) {
                        if ($(`.${type}-word > li`).length >= 10) {
                            $(`.${type}-word > li:last-child`).remove()
                        }
                        $(result).prependTo($(`.${type}-word`)).addClass("word-memo")
                        setTimeout(function(){
                            $(result).removeClass("word-memo")
                        }, 700)
                        $(`.add_word_${type}`).parent().parent().find("input[type='text']").each(function(){
                            $(this).val("")
                        })
                    }
                    if (type === "unl") {
                        addUnlWordPrgTrackerAjax()
                        count_unl += 1
                        $(".count-unl").html(count_unl)
                        $(".count-l").html(count_l)
                    } else if (type === "l") {
                        addLWordPrgTrackerAjax()
                        count_l += 1
                        $(".count-unl").html(count_unl)
                        $(".count-l").html(count_l)
                    }
                } else {
                    $(`.${type}-word`).append(result)
                }
                if (tr_list) {
                    if (tr_list.length == 1) {
                        $(`.${type}-word .tr${obj_id} span`).html("Türkçesi:")
                        $(`.${type}-word .tr${obj_id} ul`).append(`<li>${tr_list[0]}</li>`)
                    } else {
                        $(`.${type}-word .tr${obj_id} span`).html("Türkçeleri:")
                        tr_list.map(function(obj){
                            $(`.${type}-word .tr${obj_id} ul`).append(`<li>${obj}</li>`)
                        })
                    }
                } else {
                    $(`.${type}-word .tr${obj_id} ul`).append(`
                    <div>
                        <strong>&#8722;</strong><span>Bu kelimeye Türkçe eklenmemiş</span><strong>&#8722;</strong>
                    </div>`)
                }
                if (obj_audio) {
                    $(`[data-id=${obj_id}] i.audio`).attr("title", "Dinle").html("volume_up")
                    $(`[data-id=${obj_id}] audio`).attr("src", `${obj_audio}`)
                } else {
                    $(`[data-id=${obj_id}] i.audio`).attr("title", "Ses mevcut değil").html("volume_off")
                }
                if (obj_is_seen) {
                    $(`[data-id=${obj_id}] i.check-seen`).addClass("word-seen").attr("title", "Görüldü")
                } else {
                    $(`[data-id=${obj_id}] i.check-seen`).addClass("word-unseen").attr("title", "Görülmedi")
                }
                if (!(obj_is_starred)) {
                    $(`[data-id=${obj_id}] i.star`).attr("title", "Favorilere ekle").html("star_border")
                } else {
                    $(`[data-id=${obj_id}] i.star`).attr("title", "Favorilerden çıkar").addClass("pale-yellow").html("star")
                }
            }
            if (purpose=="delete") {
                if (type=="unl") {
                    count_unl -= 1
                    $(".count-unl").html(count_unl)
                } else {
                    count_l -= 1
                    $(".count-l").html(count_l)
                }
            } else if (purpose=="memorize") {
                if (type=="unl") {
                    $(`div[data-id=${wordId}] .memorize`).html("undo").toggleClass("check-learn check-unlearn").attr("title", "Unuttum")
                    count_unl -= 1
                    count_l += 1
                    addLWordPrgTrackerAjax()
                } else if (type=="l") {
                    $(`div[data-id=${wordId}] .memorize`).html("check_box").toggleClass("check-unlearn check-learn").attr("title", "Ezberledim")
                    count_l -= 1
                    count_unl += 1
                    deleteLWordAjax()
                }
                $(".count-unl").html(count_unl)
                $(".count-l").html(count_l)
            }
        }
    var new_count = parseInt( $(`.count-${type}`).html() )
    var other_count = parseInt( $(`.count-${other_type}`).html() )
    var return_array = [list_el, new_count, other_count]

    return return_array
}

function pagination(purpose, count, type) {
    var query_name = (type=="unl") ? "s" : "p"
    if (purpose=="add") {
        last_page_no = ""
        if ( (count != 1) && (count % 10 == 1) ) {
            var pagination_last_el = $(`.pagination-${type} .page-item`).eq(-2)
            if (count == 11) {
                var last_page_no = parseInt( pagination_last_el.find("span").html() )
                console.log(1, parseInt(last_page_no))
            } else {
                var last_page = pagination_last_el.find("a").html()
                if ( last_page != "…" ) {
                    var last_page_no = parseInt( last_page )
                } else {
                    var last_page_no = "…"
                }
                console.log(2, parseInt(last_page_no))
            }
            if (last_page_no != "…") {
                var new_page_no = last_page_no + 1
                $(`.pagination-${type} .page-item:last-child`).before(`
                  <li class="page-item">
                    <a class="page-link" href="?${query_name}=${new_page_no}">${new_page_no}</a>
                  </li>
                `)
                pagination_last_el.next().next().removeClass("disabled").find("a").attr("href", `?${query_name}=${new_page_no}`)
            }
        }
    } else if (purpose=="delete") {
        if ( (count != 0) && (count % 10 == 0) ) {
            var pagination_last_el = $(`.pagination-${type} .page-item`).eq(-2)
            if (pagination_last_el.hasClass("active")) {
                var prev_page_no = parseInt(pagination_last_el.text()) - 1
                pagination_last_el.remove()
                setTimeout(function() {
                    window.location.href = "/kelime_listesi/?" + query_name + "=" + prev_page_no
                }, 200)
            } else {
                pagination_last_el.remove()
            }
        }
    }
}