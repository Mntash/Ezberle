scroll = $(".scroll_top")
window.onscroll = function() {scrollFunction()}
function scrollFunction() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    scroll.css("display", "block")
  } else {
    scroll.css("display", "none")
  }
}

$(".object-content").click(function(){
    if ( $(this).attr("data-target") == "#quiz-unl" ) {
        $.ajax({
            type:"GET",
            url: "{% url 'get-count' %}",
            data: {
                "count_unl": 1,
            },
            dataType: 'json',
            success: function(data) {
                $("#count_unl").html(data.count_unl)
                $(".quiz_unl_rights").html(data.quiz_rights)
            }
        })
    } else if ( $(this).attr("data-target") == "#quiz-l" ) {
        $.ajax({
            type:"GET",
            url: "{% url 'get-count' %}",
            data: {
                "count_l": 1,
            },
            dataType: 'json',
            success: function(data) {
                $("#count_l").html(data.count_l)
                $(".quiz_l_rights").html(data.quiz_rights)
            }
        })
    } else if ( $(this).attr("data-target") == "#quiz-db" ) {
        $.ajax({
            type:"GET",
            url: "{% url 'get-count' %}",
            data: {
                "count_db": 1,
            },
            dataType: 'json',
            success: function(data) {
                $(".quiz_db_rights").html(data.quiz_rights)
            }
        })
    }
})

$(".object-content").hover(
    function(){
        $(this).find("img").attr("src", "/static/img/ref-arrow-white.png")
    },
    function(){
        $(this).find("img").attr("src", "/static/img/ref-arrow-ired.png")
    },
)

async function startDb() {
    var result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "{% url 'get-count' %}",
            data: {
                "count_db": 1,
            },
            dataType: 'json',
            success: function(data) {
                quiz_rights = data.quiz_rights
            }
        })
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function startUnl() {
    var result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "{% url 'get-count' %}",
            data: {
                "count_unl": 1,
            },
            dataType: 'json',
            success: function(data) {
                quiz_rights = data.quiz_rights
            }
        })
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function isAddedUnl() {
    var result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "{% url 'reminder' %}",
            data: {
                'is_added': 'is_added',
                'word': word,
            },
            dataType: 'json',
            success: function(data) {
                is_added = data.is_added
            }
        })
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function startL() {
    var result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "{% url 'get-count' %}",
            data: {
                "count_l": 1,
            },
            dataType: 'json',
            success: function(data) {
                quiz_rights = data.quiz_rights
            }
        })
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function isAddedL() {
    var result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "{% url 'reminder' %}",
            data: {
                'is_added': 'is_added',
                'word': word,
            },
            dataType: 'json',
            success: function(data) {
                is_added = data.is_added
            }
        })
        return result;
    } catch (error) {
        console.error(error);
    }
}

$(".start").click(function() {
    if(!event.detail || event.detail == 1) {
        var ths = $(this)
        if (ths.hasClass("start-db")) {
            startDb()
            setTimeout(function(){
                if ( quiz_rights > 0 ) {
                $.ajax({
                    type:"POST",
                    url: "{% url 'complete-quiz' %}",
                    data: {
                        "quiz-db": "quiz-db",
                        "csrfmiddlewaretoken" : "{{csrf_token}}"
                    },
                    dataType: 'json',
                })
                var value = $("#sel-db").val()
                var correct_list = []
                var incorrect_list = []
                  $(".modal-body-content-db").fadeOut()
                  setTimeout(function() {
                    $(".modal-body-content-db").empty()
                    $(".modal-body-db").append(`<div class="loader-wrapper loader-wrapper-db center">
                                                  <div class="loader loader">
                                                    <div>
                                                      <ul>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg></li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        </ul>
                                                    </div>
                                                    <span>Y??kleniyor</span>
                                                  </div>
                                                 </div>`)
                  }, 500)
                    $.ajax({
                        type:"GET",
                        url: "{% url 'quiz-and-refresh' %}",
                        data: {
                            'random-db': value,
                        },
                        dataType: 'json',
                        success: function(data) {
                            var tr_list = data.tr_list
                            if (data.random_db) {
                                $(".loader-wrapper-db").remove()
                                $(".modal-body-content-db").append(
                                  `<div role="tabpanel">
                                    <ul class="nav nav-tabs-db" role="tablist"></ul>
                                    <div class="tab-content tab-content-db"></div>
                                   </div>
                                    <div class="modal fade confirm confirm-1" tabindex="-1" role="dialog" aria-labelledby="confirm" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered" role="document">
                                            <div class="modal-content quiz-finish-modal">
                                              <div class="modal-body confirm-text-1"></div>
                                              <div class="modal-footer">
                                                <button type="button" class="btn-danger-custom confirm-no-1" data-dismiss="confirm">??ptal</button>
                                                <button type="button" class="btn-before confirm-ok-1">Onayla</button>
                                              </div>
                                            </div>
                                        </div>
                                    </div>`)
                                $(".modal-body-content-db").fadeIn()
                                for (i=1;i<=value;i++) {
                                  $(".nav-tabs-db").append(`<li role="presentation" class="nav-item">
                                                                <a data-id="db" class="nav-link" href="#db-${i}" aria-controls="db-${i}" role="tab" data-toggle="tab">${i}</a>
                                                             </li>`)
                                  $(".tab-content-db").append(`<div data-no="${i}" role="tabpanel" class="tab-pane" id="db-${i}"></div>`)
                                }
                                $(".nav-tabs-db").find("a").first().click()
                                data.random_db.map(function(i) {
                                    var index = data.random_db.indexOf(i) + 1
                                    var tr = tr_list[index-1]
                                    $(`#db-${index}`).append(`<div class="quiz-question mb-2">
                                    <button data-id="db" class="chevron-left"><i class="fas fa-chevron-left chevron"></i></button>
                                    <span class="word-db center">${i}</span>
                                    <button data-id="db" class="chevron-right"><i class="fas fa-chevron-right chevron"></i></button>
                                    </div>
                                    <div class="d-flex justify-content-center hak")>0/2</div>
                                    <div class="d-flex justify-content-center mb-2 mt-1">
                                        <input type="text" class="quiz-answer mr-1" placeholder="Min. 2 harf">
                                        <div class="quiz-result"></div>
                                    </div>
                                    <div class="d-flex justify-content-center">
                                        <button class="btn-secondary mr-2 quiz-dk-db">Bilmiyorum</button>
                                        <button class="btn-before quiz-answer-btn">Cevapla</button>
                                    </div>
                                    <div class="mt-3 quiz-tr">
                                        <div>T??rk??eleri:</div>
                                        <div><ul></ul></div>
                                    </div>
                                    <div class="quiz-finish-div d-flex justify-content-end"><button class="btn-danger-custom quiz-finish quiz-finish-db" data-toggle="confirmation">Quiz'i bitir</button></div>`)
                                })
                                tr_list.map(function(obj, i){
                                    if ( !(obj.length) ) {
                                        $(".quiz-tr ul").eq(i).append("<u>Kelime'nin T??rk??esi bulunamad?????? i??in l??tfen bu soruyu bo?? ge??in.</u>")
                                    }
                                })
                                $(document).on("click", ".quiz-dk-db", function() {
                                    let ths = $(this)
                                    var no = parseInt(ths.parent().parent().attr("data-no"))
                                    var tr = tr_list[no-1]
                                    ths.parent().prev().find(".quiz-answer").addClass("box-dk").prop("placeholder", "")
                                    .prop("disabled", "true").css("opacity", ".65")
                                    ths.prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                    ths.next().prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                    var word = ths.parent().prevAll().eq(2).find("span").text()
                                    incorrect_list.push(word)
                                    tr.map(function(i){
                                        ths.parent().next().find("ul").hide().append(`<li>${i}</li>`).fadeIn()
                                    })
                                    $(this).parent().prev().find(".quiz-result").append(`
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                        <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                         stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="87.8" y2="92.3"/>
                                        <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                         stroke-linecap="round" stroke-miterlimit="10" x1="89.8" y1="38" x2="34.4" y2="92.2"/>
                                        </svg>`)
                                    setTimeout(function() {
                                        ths.parent().prev().find(".quiz-result").find(".path").removeClass("path")
                                    }, 1000)
                                })
                                $(document).on("keypress", ".quiz-answer", function() {
                                    var keycode = (event.keyCode ? event.keyCode : event.which)
                                    if(keycode == '13'){
                                        $(this).parent().next().find(".quiz-answer-btn").click()
                                    }
                                })
                                $(document).on("click", ".quiz-answer-btn", function() {
                                    var count = parseInt($(this).parent().prev().prev().text().split("/")[0])
                                    var no = parseInt($("a.active").text())
                                    let ths = $(this)
                                    var tr = tr_list[no-1]
                                    if (ths.parent().prev().find(".quiz-answer").val().trim().length >= 2) {
                                        if (tr.includes( ths.parent().prev().find(".quiz-answer").val().toLowerCase().trim() )) {
                                            if ( ths.parent().prev().find(".quiz-answer").hasClass("shake") ) {
                                                ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                            }
                                            ths.parent().prev().find(".quiz-answer").css("border-color", "#2cb74c")
                                            .css("box-shadow", "0px 0px 5px #2cb74c").prop("disabled", "true").css("opacity", ".65")
                                            ths.prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                            ths.prev().prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                            var word = ths.parent().prevAll().eq(2).find("span").text()
                                            correct_list.push(word)
                                            tr.map(function(i){
                                                ths.parent().next().find("ul").hide().append(`<li>${i}</li>`).fadeIn()
                                            })
                                            ths.parent().prev().find(".quiz-result").append(`
                                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                            <polyline class="path check" fill="none" stroke="#2cb74c" stroke-width="6"
                                            stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
                                            </svg>`)
                                            setTimeout(function() {
                                                ths.parent().prev().find(".quiz-result").find(".path").removeClass("path")
                                            }, 1000)
                                        } else {
                                            if (count==0) {
                                                ths.parent().prev().find(".quiz-answer").addClass("shake box-dk")
                                                ths.parent().prev().prev().html("1/2")
                                                setTimeout(function() {
                                                    ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                                }, 300)
                                            } else if (count==1) {
                                                if ( ths.parent().prev().find(".quiz-answer").hasClass("shake") ) {
                                                    ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                                }
                                                ths.prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                                ths.prev().prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                                ths.parent().prev().prev().html("2/2")
                                                ths.parent().prev().find(".quiz-answer").prop("disabled", "true").css("opacity", ".65")
                                                var word = $(this).parent().prevAll().eq(2).find("span").text()
                                                incorrect_list.push(word)
                                                tr.map(function(i){
                                                    ths.parent().next().find("ul").hide().append(`<li>${i}</li>`).fadeIn()
                                                })
                                                ths.parent().prev().find(".quiz-result").append(`
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                                    <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                                     stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="87.8" y2="92.3"/>
                                                    <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                                     stroke-linecap="round" stroke-miterlimit="10" x1="89.8" y1="38" x2="34.4" y2="92.2"/>
                                                    </svg>`)
                                                setTimeout(function() {
                                                    ths.parent().prev().find(".quiz-result").find(".path").removeClass("path")
                                                }, 1000)
                                            }
                                        }
                                    } else {
                                        ths.parent().prev().find(".quiz-answer").addClass("shake")
                                        setTimeout(function() {
                                            ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                        }, 300)
                                    }
                                })
                                $(document).on("click", ".quiz-finish-db", function() {
                                    if ((incorrect_list.length + correct_list.length) < value) {
                                        $(".confirm-text-1").html("Cevaplamad??????n sorular var.<br> Quiz'i bitirmek istedi??ine emin misin?")
                                        $(".confirm-1").modal()
                                    } else {
                                        $(".confirm-text-1").html("Quiz'i bitirmek istedi??ine emin misin?")
                                        $(".confirm-1").modal()
                                    }
                                })
                                $(document).on("click", ".confirm-ok-1", function(e) {
                                    e.preventDefault()
                                    $(document).find(".quiz-dk-db").click()
                                    $.ajax({
                                        type:"POST",
                                        url: "{% url 'save-quiz' %}",
                                        data: {
                                            'quiz_db': true,
                                            'correct_list': correct_list,
                                            'incorrect_list': incorrect_list,
                                            'csrfmiddlewaretoken' : '{{csrf_token}}'
                                        },
                                        dataType: 'json',
                                    })
                                    $.ajax({
                                        type:"GET",
                                        url: "{% url 'prg-tracker' %}",
                                        data:{
                                           "ach_no": [3, 11],
                                           "up_or_down": 1
                                        }
                                    })
                                    $(".nav-tabs-db").append(`<li role="presentation" class="nav-item">
                                                                <a data-id="db" class="nav-link" href=".res-db" aria-controls="res-db" role="tab" data-toggle="tab"><i class="fas fa-list-ol"></i></a>
                                                               </li>`)
                                    $(".tab-content-db").append(`<div role="tabpanel" class="tab-pane res-db">
                                                                    <div>
                                                                        <span class="results">Sonu??lar</span>
                                                                        ${value} adet sorudan ${correct_list.length} tanesini do??ru yapt??n.
                                                                        <ul class="modal-list res-db-ul"></ul>
                                                                    </div>
                                                                  </div>`)
                                    for (i=0;i<value;i++) {
                                        word = $(document).find(".word-db").eq(i).text()
                                        if (correct_list.includes(word)) {
                                            $(".res-db-ul").append(`<li data-id="${i}">
                                                                      <a class="correct" href="" data-id="res-word">${word}</a>
                                                                      <a target="_blank" title="S??zl??kte arat" href="/s??zl??k/q=${word}">
                                                                        <i class="fa fa-search"></i>
                                                                      </a>
                                                                    </li>`)
                                        } else {
                                            $(".res-db-ul").append(`<li data-id="${i}">
                                                                      <a class="incorrect" href="" data-id="res-word">${word}</a>
                                                                      <a target="_blank" title="S??zl??kte arat" href="/s??zl??k/q=${word}">
                                                                        <i class="fa fa-search"></i>
                                                                      </a>
                                                                    </li>`)
                                        }
                                    }
                                    $(".quiz-finish-db").remove()
                                    $("a[data-id='res-word']").click(function(e){
                                        e.preventDefault()
                                        var target = $(this).parent().attr("data-id")
                                        $("a[data-id='db']").eq(target).click()
                                    })
                                    $(".confirm-1").modal("hide")
                                    setTimeout(function() {
                                        $("a[aria-controls='res-db']").click()
                                    }, 4)
                                })
                                $(document).on("click", ".confirm-no-1", function(e) {
                                    e.preventDefault()
                                    $(".confirm-1").modal("hide")
                                })
                                $(".quiz-question:first").find(".chevron-left[data-id='db']").remove()
                                $(".quiz-question:last").find(".chevron-right[data-id='db']").remove()
                            }
                        }
                    })
            } else {
                $(".quiz-err-db").remove()
                ths.after(`<div class="quiz-err-db mt-1">* G??nl??k Quiz haklar??n??z?? tamamlam????s??n??z.
                                                            Yar??n tekrar gelin!</div>`)
            }
            }, 40)
        } else if (ths.hasClass("start-unl")) {
            quiz_rights = 0
            startUnl()
            setTimeout(function(){
                if ( quiz_rights > 0 ) {
                $.ajax({
                    type:"POST",
                    url: "{% url 'complete-quiz' %}",
                    data: {
                        "quiz-unl": "quiz-unl",
                        "csrfmiddlewaretoken" : "{{csrf_token}}"
                    },
                    dataType: 'json',
                })
                var value = $("#sel-unl").val()
                var correct_list = []
                var incorrect_list = []
                var count = $("#count_unl").text()
                var gap = value - count
                if ( gap > 0 ) {
                  if ( !($(".quiz-err-unl").length) ) {
                    ths.after(`<div class="quiz-err-unl mt-1">* Quiz\'e ba??lamak i??in listenizde yeterince kelime bulunmuyor.
                                En az ${gap} kelime daha ekleyip tekrar deneyin.</div>`)
                  } else {
                    $(".quiz-err-unl").remove()
                    ths.after(`<div class="quiz-err-unl mt-1">* Quiz\'e ba??lamak i??in listenizde yeterince kelime bulunmuyor.
                                En az ${gap} kelime daha ekleyip tekrar deneyin.</div>`)
                  }
                } else {
                  $(".quiz-err-unl").remove()
                  $(".modal-body-content-unl").fadeOut()
                  setTimeout(function() {
                    $(".modal-body-content-unl").empty()
                    $(".modal-body-unl").append(`<div class="loader-wrapper loader-wrapper-unl center">
                                                  <div class="loader loader">
                                                    <div>
                                                      <ul>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg></li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        </ul>
                                                    </div>
                                                    <span>Y??kleniyor</span>
                                                  </div>
                                                 </div>`)
                  }, 500)
                    $.ajax({
                        type:"GET",
                        url: "{% url 'quiz-and-refresh' %}",
                        data: {
                            'random-unlearned': value,
                        },
                        dataType: 'json',
                        success: function(data) {
                            var tr_list = data.tr_list
                            if (data.random_unlearned) {
                                $(".loader-wrapper-unl").remove()
                                $(".modal-body-content-unl").append(
                                  `<div role="tabpanel">
                                    <ul class="nav nav-tabs-unl" role="tablist"></ul>
                                    <div class="tab-content tab-content-unl"></div>
                                   </div>
                                    <div class="modal fade confirm confirm-2" tabindex="-1" role="dialog" aria-labelledby="confirm" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered" role="document">
                                            <div class="modal-content quiz-finish-modal">
                                              <div class="modal-body confirm-text-2"></div>
                                              <div class="modal-footer">
                                                <button type="button" class="btn-danger-custom confirm-no-2" data-dismiss="confirm">??ptal</button>
                                                <button type="button" class="btn-before confirm-ok-2">Onayla</button>
                                              </div>
                                            </div>
                                        </div>
                                    </div>`)
                                for (i=1;i<=value;i++) {
                                  $(".nav-tabs-unl").append(`<li role="presentation" class="nav-item">
                                                                <a data-id="unl" class="nav-link" href="#unl-${i}" aria-controls="unl-${i}" role="tab" data-toggle="tab">${i}</a>
                                                             </li>`)
                                  $(".tab-content-unl").append(`<div data-no="${i}" role="tabpanel" class="tab-pane" id="unl-${i}"></div>`)
                                }
                                $(".nav-tabs-unl").find("a").first().click()
                                data.random_unlearned.map(function(i) {
                                    var index = data.random_unlearned.indexOf(i) + 1
                                    var tr = tr_list[index-1]
                                    $(`#unl-${index}`).append(`<div class="quiz-question mb-2">
                                    <button data-id="unl" class="chevron-left"><i class="fas fa-chevron-left chevron"></i></button>
                                    <span class="word-unl center">${i}</span>
                                    <button data-id="unl" class="chevron-right"><i class="fas fa-chevron-right chevron"></i></button>
                                    </div>
                                    <div class="d-flex justify-content-center hak")>0/2</div>
                                    <div class="d-flex justify-content-center mb-2 mt-1">
                                        <input type="text" class="quiz-answer mr-1" placeholder="Min. 2 harf"">
                                        <div class="quiz-result"></div>
                                    </div>
                                    <div class="d-flex justify-content-center">
                                        <button class="btn-secondary mr-2 quiz-dk-unl">Bilmiyorum</button>
                                        <button class="btn-before quiz-answer-btn">Cevapla</button>
                                    </div>
                                    <div class="mt-3 quiz-tr">
                                        <div>T??rk??eleri:</div>
                                        <div><ul></ul></div>
                                    </div>
                                    <div class="quiz-finish-div d-flex justify-content-end">
                                        <button class="btn-danger-custom quiz-finish quiz-finish-unl" data-toggle="confirmation">Quiz'i bitir</button>
                                    </div>`)
                                })
                                tr_list.map(function(obj, i){
                                    if ( !(obj.length) ) {
                                        $(".quiz-tr ul").eq(i).append("<u>Kelime'nin T??rk??esi bulunamad?????? i??in l??tfen bu soruyu bo?? ge??in.</u>")
                                    }
                                })
                                $(document).on("click", ".quiz-dk-unl", function() {
                                    let ths = $(this)
                                    var no = parseInt(ths.parent().parent().attr("data-no"))
                                    var tr = tr_list[no-1]
                                    ths.parent().prev().find(".quiz-answer").addClass("box-dk").prop("placeholder", "")
                                    .prop("disabled", "true").css("opacity", ".65")
                                    ths.prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                    ths.next().prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                    var word = ths.parent().prevAll().eq(2).find("span").text()
                                    incorrect_list.push(word)
                                    tr.map(function(i){
                                        ths.parent().next().find("ul").hide().append(`<li>${i}</li>`).fadeIn()
                                    })
                                    $(this).parent().prev().find(".quiz-result").append(`
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                        <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                         stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="87.8" y2="92.3"/>
                                        <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                         stroke-linecap="round" stroke-miterlimit="10" x1="89.8" y1="38" x2="34.4" y2="92.2"/>
                                        </svg>`)
                                    setTimeout(function() {
                                        ths.parent().prev().find(".quiz-result").find(".path").removeClass("path")
                                    }, 1000)
                                })
                                $(document).on("keypress", ".quiz-answer", function() {
                                    var keycode = (event.keyCode ? event.keyCode : event.which)
                                    if(keycode == '13'){
                                        $(this).parent().next().find(".quiz-answer-btn").click()
                                    }
                                })
                                $(document).on("click", ".quiz-answer-btn", function() {
                                    var count = parseInt($(this).parent().prev().prev().text().split("/")[0])
                                    var no = parseInt($("a.active").text())
                                    let ths = $(this)
                                    var tr = tr_list[no-1]
                                    if (ths.parent().prev().find(".quiz-answer").val().trim().length >= 2) {
                                        if (tr.includes( ths.parent().prev().find(".quiz-answer").val().toLowerCase().trim() )) {
                                            if ( ths.parent().prev().find(".quiz-answer").hasClass("shake") ) {
                                                ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                            }
                                            ths.parent().prev().find(".quiz-answer").css("border-color", "#2cb74c")
                                            .css("box-shadow", "0px 0px 5px #2cb74c").prop("disabled", "true").css("opacity", ".65")
                                            ths.prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                            ths.prev().prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                            var word = ths.parent().prevAll().eq(2).find("span").text()
                                            correct_list.push(word)
                                            tr.map(function(i){
                                                ths.parent().next().find("ul").hide().append(`<li>${i}</li>`).fadeIn()
                                            })
                                            ths.parent().prev().find(".quiz-result").append(`
                                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                            <polyline class="path check" fill="none" stroke="#2cb74c" stroke-width="6"
                                            stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
                                            </svg>`)
                                            setTimeout(function() {
                                                ths.parent().prev().find(".quiz-result").find(".path").removeClass("path")
                                            }, 1000)
                                        } else {
                                            if (count==0) {
                                                ths.parent().prev().find(".quiz-answer").addClass("shake box-dk")
                                                ths.parent().prev().prev().html("1/2")
                                                setTimeout(function() {
                                                    ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                                }, 300)
                                            } else if (count==1) {
                                                if ( ths.parent().prev().find(".quiz-answer").hasClass("shake") ) {
                                                    ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                                }
                                                ths.prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                                ths.prev().prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                                ths.parent().prev().prev().html("2/2")
                                                ths.parent().prev().find(".quiz-answer").prop("disabled", "true").css("opacity", ".65")
                                                var word = $(this).parent().prevAll().eq(2).find("span").text()
                                                incorrect_list.push(word)
                                                tr.map(function(i){
                                                    ths.parent().next().find("ul").hide().append(`<li>${i}</li>`).fadeIn()
                                                })
                                                ths.parent().prev().find(".quiz-result").append(`
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                                    <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                                     stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="87.8" y2="92.3"/>
                                                    <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                                     stroke-linecap="round" stroke-miterlimit="10" x1="89.8" y1="38" x2="34.4" y2="92.2"/>
                                                    </svg>`)
                                                setTimeout(function() {
                                                    ths.parent().prev().find(".quiz-result").find(".path").removeClass("path")
                                                }, 1000)
                                            }
                                        }
                                    } else {
                                        ths.parent().prev().find(".quiz-answer").addClass("shake")
                                        setTimeout(function() {
                                            ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                        }, 300)
                                    }
                                })
                                $(document).on("click", ".quiz-finish-unl", function() {
                                    if ((incorrect_list.length + correct_list.length) < value) {
                                        $(".confirm-text-2").html("Cevaplamad??????n sorular var.<br> Quiz'i bitirmek istedi??ine emin misin?")
                                        $(".confirm-2").modal()
                                    } else {
                                        $(".confirm-text-2").html("Quiz'i bitirmek istedi??ine emin misin?")
                                        $(".confirm-2").modal()
                                    }
                                })
                                $(document).on("click", ".confirm-ok-2", function(e) {
                                    e.preventDefault()
                                    $(document).find(".quiz-dk-unl").click()
                                    $.ajax({
                                        type:"POST",
                                        url: "{% url 'save-quiz' %}",
                                        data: {
                                            'quiz_unl': true,
                                            'correct_list': correct_list,
                                            'incorrect_list': incorrect_list,
                                            'csrfmiddlewaretoken' : '{{csrf_token}}'
                                        },
                                        dataType: 'json',
                                    })
                                    $.ajax({
                                        type:"GET",
                                        url: "{% url 'prg-tracker' %}",
                                        data:{
                                           "ach_no": [3, 11],
                                           "up_or_down": 1,
                                        }
                                    })
                                    $(".nav-tabs-unl").append(`<li role="presentation" class="nav-item">
                                                                <a data-id="unl" class="nav-link" href=".res-unl" aria-controls="res-unl" role="tab" data-toggle="tab"><i class="fas fa-list-ol"></i></a>
                                                               </li>`)
                                    $(".tab-content-unl").append(`<div role="tabpanel" class="tab-pane res-unl">
                                                                    <div>
                                                                        <span class="results">Sonu??lar</span>
                                                                        ${value} adet sorudan ${correct_list.length} tanesini do??ru yapt??n.
                                                                        <ul class="modal-list res-unl-ul"></ul>
                                                                    </div>
                                                                  </div>`)
                                    for (i=0;i<value;i++) {
                                        word = $(document).find(".word-unl").eq(i).text()
                                        is_added = ""
                                        isAddedUnl()
                                        if (correct_list.includes(word)) {
                                            $(".res-unl-ul").append(`<li data-id="${i}">
                                                                  <a class="correct" href="" data-id="res-word">${word}</a>
                                                                  <div class="dropdown">
                                                                      <button class="btn-dd"
                                                                              type="button" id="dropdownResUnl" data-toggle="dropdown"
                                                                              aria-haspopup="true" aria-expanded="false">
                                                                        <img src="{% static 'img/menu.png' %}" alt="Menu">
                                                                      </button>
                                                                      <div data-id="unl-${i}" class="dropdown-menu" aria-labelledby="dropdownResUnl">
                                                                        <a target="_blank" class="dropdown-item" href="/s??zl??k/q=${word}">
                                                                            <i class="fa fa-search"></i>
                                                                            S??zl??kte arat
                                                                        </a>
                                                                        <a target="_blank" class="dropdown-item" href="/kelime_listesi/q=${word}">
                                                                            <i class="fas fa-clipboard-list"></i>
                                                                            Listende g??r??nt??le
                                                                        </a>
                                                                      </div>
                                                                  </div>
                                                                  </li>`)
                                            if (is_added) {
                                                $(`div[data-id='unl-${i}']`).append(`<a class="dropdown-item" href="#!">
                                                                                         <i class="fas fa-bell"></i>
                                                                                         <span>Hat??rlat??c??dan kald??r</span>
                                                                                     </a>`)
                                            } else {
                                                $(`div[data-id='unl-${i}']`).append(`<a class="dropdown-item" href="#!">
                                                                                         <i class="fas fa-bell"></i>
                                                                                         <span>Hat??rlat??c??ya ekle</span>
                                                                                     </a>`)
                                            }
                                        } else {
                                            $(".res-unl-ul").append(`<li data-id="${i}">
                                                                      <a class="incorrect" href="" data-id="res-word">${word}</a>
                                                                      <div class="dropdown">
                                                                          <button class="btn-dd"
                                                                                  type="button" id="dropdownResUnl" data-toggle="dropdown"
                                                                                  aria-haspopup="true" aria-expanded="false">
                                                                            <img src="{% static 'img/menu.png' %}" alt="Menu">
                                                                          </button>
                                                                          <div data-id="unl-${i}" class="dropdown-menu" aria-labelledby="dropdownResUnl">
                                                                            <a target="_blank" class="dropdown-item" href="/s??zl??k/q=${word}">
                                                                                <i class="fa fa-search"></i>
                                                                                S??zl??kte arat
                                                                            </a>
                                                                            <a target="_blank" class="dropdown-item" href="/kelime_listesi/q=${word}">
                                                                                <i class="fas fa-clipboard-list"></i>
                                                                                Listende g??r??nt??le
                                                                            </a>
                                                                          </div>
                                                                      </div>
                                                                     </li>`)
                                            isAddedL()
                                            if (is_added) {
                                                $(`div[data-id='unl-${i}']`).append(`<a class="dropdown-item" href="#!">
                                                                                         <i class="fas fa-bell"></i>
                                                                                         <span>Hat??rlat??c??dan kald??r</span>
                                                                                     </a>`)
                                            } else {
                                                $(`div[data-id='unl-${i}']`).append(`<a class="dropdown-item" href="#!">
                                                                                         <i class="fas fa-bell"></i>
                                                                                         <span>Hat??rlat??c??ya ekle</span>
                                                                                     </a>`)
                                            }
                                        }
                                    }
                                    $(".quiz-finish-unl").remove()
                                    $("a[data-id='res-word']").click(function(e){
                                        e.preventDefault()
                                        var target = $(this).parent().attr("data-id")
                                        $("a[data-id='unl']").eq(target).click()
                                    })
                                    $(".confirm-2").modal("hide")
                                    setTimeout(function() {
                                        $("a[aria-controls='res-unl']").click()
                                    }, 4)
                                })
                                $(document).on("click", ".confirm-no-2", function(e) {
                                    e.preventDefault()
                                    $(".confirm-2").modal("hide")
                                })
                                $(".quiz-question:first").find(".chevron-left[data-id='unl']").remove()
                                $(".quiz-question:last").find(".chevron-righ[data-id='unl']t").remove()
                            }
                        }
                    })
                    $(".modal-body-content-unl").fadeIn()
                }
            } else {
                $(".quiz-err-unl").remove()
                ths.after(`<div class="quiz-err-unl mt-1">* G??nl??k Quiz haklar??n??z?? tamamlam????s??n??z.
                                                            Yar??n tekrar gelin!</div>`)
            }
            }, 40)
        } else if (ths.hasClass("start-l")) {
            quiz_rights = 0
            startL()
            setTimeout(function(){
                if ( quiz_rights > 0 ) {
                $.ajax({
                    type:"POST",
                    url: "{% url 'complete-quiz' %}",
                    data: {
                        "quiz-l": "quiz-l",
                        "csrfmiddlewaretoken" : "{{csrf_token}}"
                    },
                    dataType: 'json',
                })
                var value = $("#sel-l").val()
                var correct_list = []
                var incorrect_list = []
                var count = $("#count_l").text()
                var gap = value - count
                if ( gap > 0 ) {
                  if ( !($(".quiz-err-l").length) ) {
                    ths.after(`<div class="quiz-err-l mt-1">* Quiz\'e ba??lamak i??in listenizde yeterince kelime bulunmuyor.
                                En az ${gap} kelime daha ekleyip tekrar deneyin.</div>`)
                  } else {
                    $(".quiz-err-l").remove()
                    ths.after(`<div class="quiz-err-l mt-1">* Quiz\'e ba??lamak i??in listenizde yeterince kelime bulunmuyor.
                                En az ${gap} kelime daha ekleyip tekrar deneyin.</div>`)
                  }
                } else {
                  $(".quiz-err-l").remove()
                  $(".modal-body-content-l").fadeOut()
                  setTimeout(function() {
                    $(".modal-body-content-l").empty()
                    $(".modal-body-l").append(`<div class="loader-wrapper loader-wrapper-l center">
                                                  <div class="loader loader">
                                                    <div>
                                                      <ul>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg></li>
                                                        <li><svg viewBox="0 0 90 120" fill="currentColor">
                                                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                                            </svg>
                                                        </li>
                                                        </ul>
                                                    </div>
                                                    <span>Y??kleniyor</span>
                                                  </div>
                                                 </div>`)
                  }, 500)
                    $.ajax({
                        type:"GET",
                        url: "{% url 'quiz-and-refresh' %}",
                        data: {
                            'random-learned': value,
                        },
                        dataType: 'json',
                        success: function(data) {
                            var tr_list = data.tr_list
                            if (data.random_learned) {
                                $(".loader-wrapper-l").remove()
                                $(".modal-body-content-l").append(
                                  `<div role="tabpanel">
                                    <ul class="nav nav-tabs-l" role="tablist"></ul>
                                    <div class="tab-content tab-content-l"></div>
                                   </div>
                                    <div class="modal fade confirm confirm-3" tabindex="-1" role="dialog" aria-labelledby="confirm" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered" role="document">
                                            <div class="modal-content quiz-finish-modal">
                                              <div class="modal-body confirm-text-3"></div>
                                              <div class="modal-footer">
                                                <button type="button" class="btn-danger-custom confirm-no-3" data-dismiss="confirm">??ptal</button>
                                                <button type="button" class="btn-before confirm-ok-3">Onayla</button>
                                              </div>
                                            </div>
                                        </div>
                                    </div>`)
                                for (i=1;i<=value;i++) {
                                  $(".nav-tabs-l").append(`<li role="presentation" class="nav-item">
                                                            <a data-id="l" class="nav-link" href="#l-${i}" aria-controls="l-${i}" role="tab" data-toggle="tab">${i}</a>
                                                            </li>`)
                                  $(".tab-content-l").append(`<div data-no="${i}" role="tabpanel" class="tab-pane" id="l-${i}"></div>`)
                                }
                                $(".nav-tabs-l").find("a").first().click()
                                data.random_learned.map(function(i) {
                                    var index = data.random_learned.indexOf(i) + 1
                                    var tr = tr_list[index-1]
                                    $(`#l-${index}`).append(`<div class="quiz-question mb-2">
                                    <button data-id="l" class="chevron-left"><i class="fas fa-chevron-left chevron"></i></button>
                                    <span class="word-l center">${i}</span>
                                    <button data-id="l" class="chevron-right"><i class="fas fa-chevron-right chevron"></i></button>
                                    </div>
                                    <div class="d-flex justify-content-center hak")>0/2</div>
                                    <div class="d-flex justify-content-center mb-2 mt-1">
                                        <input type="text" class="quiz-answer mr-1" placeholder="Min. 2 harf">
                                        <div class="quiz-result"></div>
                                    </div>
                                    <div class="d-flex justify-content-center">
                                        <button class="btn-secondary mr-2 quiz-dk-l">Bilmiyorum</button>
                                        <button class="btn-before quiz-answer-btn">Cevapla</button>
                                    </div>
                                    <div class="mt-3 quiz-tr">
                                        <div>T??rk??eleri:</div>
                                        <div><ul></ul></div>
                                    </div>
                                    <div class="quiz-finish-div d-flex justify-content-end">
                                        <button class="btn-danger-custom quiz-finish quiz-finish-l" data-toggle="confirmation">Quiz'i bitir</button>
                                    </div>`)
                                })
                                tr_list.map(function(obj, i){
                                    if ( !(obj.length) ) {
                                        $(".quiz-tr ul").eq(i).append("<u>Kelime'nin T??rk??esi bulunamad?????? i??in l??tfen bu soruyu bo?? ge??in.</u>")
                                    }
                                })
                                $(document).on("click", ".quiz-dk-l", function() {
                                    let ths = $(this)
                                    var no = parseInt(ths.parent().parent().attr("data-no"))
                                    var tr = tr_list[no-1]
                                    ths.parent().prev().find(".quiz-answer").addClass("box-dk").prop("placeholder", "")
                                    .prop("disabled", "true").css("opacity", ".65")
                                    ths.prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                    ths.next().prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                    var word = ths.parent().prevAll().eq(2).find("span").text()
                                    incorrect_list.push(word)
                                    tr.map(function(i){
                                        ths.parent().next().find("ul").hide().append(`<li>${i}</li>`).fadeIn()
                                    })
                                    $(this).parent().prev().find(".quiz-result").append(`
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                        <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                         stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="87.8" y2="92.3"/>
                                        <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                         stroke-linecap="round" stroke-miterlimit="10" x1="89.8" y1="38" x2="34.4" y2="92.2"/>
                                        </svg>`)
                                    setTimeout(function() {
                                        ths.parent().prev().find(".quiz-result").find(".path").removeClass("path")
                                    }, 1000)
                                })
                                $(document).on("keypress", ".quiz-answer", function() {
                                    var keycode = (event.keyCode ? event.keyCode : event.which)
                                    if(keycode == '13'){
                                        $(this).parent().next().find(".quiz-answer-btn").click()
                                    }
                                })
                                $(document).on("click", ".quiz-answer-btn", function() {
                                    var count = parseInt($(this).parent().prev().prev().text().split("/")[0])
                                    var no = parseInt($("a.active").text())
                                    let ths = $(this)
                                    var tr = tr_list[no-1]
                                    if (ths.parent().prev().find(".quiz-answer").val().trim().length >= 2) {
                                        if (tr.includes( ths.parent().prev().find(".quiz-answer").val().toLowerCase().trim() )) {
                                            if ( ths.parent().prev().find(".quiz-answer").hasClass("shake") ) {
                                                ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                            }
                                            ths.parent().prev().find(".quiz-answer").css("border-color", "#2cb74c")
                                            .css("box-shadow", "0px 0px 5px #2cb74c").prop("disabled", "true").css("opacity", ".65")
                                            ths.prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                            ths.prev().prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                            var word = ths.parent().prevAll().eq(2).find("span").text()
                                            correct_list.push(word)
                                            tr.map(function(i){
                                                ths.parent().next().find("ul").hide().append(`<li>${i}</li>`).fadeIn()
                                            })
                                            ths.parent().prev().find(".quiz-result").append(`
                                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                            <polyline class="path check" fill="none" stroke="#2cb74c" stroke-width="6"
                                            stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
                                            </svg>`)
                                            setTimeout(function() {
                                                ths.parent().prev().find(".quiz-result").find(".path").removeClass("path")
                                            }, 1000)
                                        } else {
                                            if (count==0) {
                                                ths.parent().prev().find(".quiz-answer").addClass("shake box-dk")
                                                ths.parent().prev().prev().html("1/2")
                                                setTimeout(function() {
                                                    ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                                }, 300)
                                            } else if (count==1) {
                                                if ( ths.parent().prev().find(".quiz-answer").hasClass("shake") ) {
                                                    ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                                }
                                                ths.prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                                ths.prev().prop("disabled", "true").addClass("disabled").addClass("not-allowed")
                                                ths.parent().prev().prev().html("2/2")
                                                ths.parent().prev().find(".quiz-answer").prop("disabled", "true").css("opacity", ".65")
                                                var word = $(this).parent().prevAll().eq(2).find("span").text()
                                                incorrect_list.push(word)
                                                tr.map(function(i){
                                                    ths.parent().next().find("ul").hide().append(`<li>${i}</li>`).fadeIn()
                                                })
                                                ths.parent().prev().find(".quiz-result").append(`
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                                    <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                                     stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="87.8" y2="92.3"/>
                                                    <line class="path line" fill="none" stroke="#ff4e4e" stroke-width="6"
                                                     stroke-linecap="round" stroke-miterlimit="10" x1="89.8" y1="38" x2="34.4" y2="92.2"/>
                                                    </svg>`)
                                                setTimeout(function() {
                                                    ths.parent().prev().find(".quiz-result").find(".path").removeClass("path")
                                                }, 1000)
                                            }
                                        }
                                    } else {
                                        ths.parent().prev().find(".quiz-answer").addClass("shake")
                                        setTimeout(function() {
                                            ths.parent().prev().find(".quiz-answer").removeClass("shake")
                                        }, 300)
                                    }
                                })
                                $(document).on("click", ".quiz-finish-l", function() {
                                    if ((incorrect_list.length + correct_list.length) < value) {
                                        $(".confirm-text-3").html("Cevaplamad??????n sorular var.<br> Quiz'i bitirmek istedi??ine emin misin?")
                                        $(".confirm-3").modal()
                                    } else {
                                        $(".confirm-text-3").html("Quiz'i bitirmek istedi??ine emin misin?")
                                        $(".confirm-3").modal()
                                    }
                                })
                                $(document).on("click", ".confirm-ok-3", function(e) {
                                    e.preventDefault()
                                    $(document).find(".quiz-dk-l").click()
                                    $.ajax({
                                        type:"POST",
                                        url: "{% url 'save-quiz' %}",
                                        data: {
                                            'quiz_l': true,
                                            'correct_list': correct_list,
                                            'incorrect_list': incorrect_list,
                                            'csrfmiddlewaretoken' : '{{csrf_token}}'
                                        },
                                        dataType: 'json',
                                    })
                                    $.ajax({
                                        type:"GET",
                                        url: "{% url 'prg-tracker' %}",
                                        data:{
                                           "ach_no": [3, 11],
                                           "up_or_down": 1,
                                        }
                                    })
                                    $(".nav-tabs-l").append(`<li role="presentation" class="nav-item">
                                                                <a data-id="l" class="nav-link" href=".res-l" aria-controls="res-l" role="tab" data-toggle="tab">
                                                                    <i class="fas fa-list-ol"></i>
                                                                </a>
                                                             </li>`)
                                    $(".tab-content-l").append(`<div role="tabpanel" class="tab-pane res-l">
                                                                    <div>
                                                                        <span class="results">Sonu??lar</span>
                                                                        ${value} adet sorudan ${correct_list.length} tanesini do??ru yapt??n.
                                                                        <ul class="modal-list res-l-ul"></ul>
                                                                    </div>
                                                                  </div>`)
                                    for (i=0;i<value;i++) {
                                        word = $(document).find(".word-l").eq(i).text()
                                        is_added = false
                                        $.ajax({
                                            type:"GET",
                                            url: "{% url 'reminder' %}",
                                            data: {
                                                'word': word,
                                                'is_added': 'is_added',
                                            },
                                            dataType: 'json',
                                            success: function(data) {
                                                if (data.is_added) {
                                                    is_added = true
                                                }
                                            }
                                        })
                                        if (correct_list.includes(word)) {
                                            $(".res-l-ul").append(`<li data-id="${i}">
                                                                  <a class="correct" href="" data-id="res-word">${word}</a>
                                                                  <div class="dropdown">
                                                                      <button class="btn-dd"
                                                                              type="button" id="dropdownResL" data-toggle="dropdown"
                                                                              aria-haspopup="true" aria-expanded="false">
                                                                        <img src="{% static 'img/menu.png' %}" alt="Menu">
                                                                      </button>
                                                                      <div data-id="l-${i}" class="dropdown-menu" aria-labelledby="dropdownResL" data-id="${i}">
                                                                        <a target="_blank" class="dropdown-item" href="/s??zl??k/q=${word}">
                                                                            <i class="fa fa-search"></i>
                                                                            S??zl??kte arat
                                                                        </a>
                                                                        <a target="_blank" class="dropdown-item" href="/kelime_listesi/q=${word}">
                                                                                <i class="fas fa-clipboard-list"></i>
                                                                                Listende g??r??nt??le
                                                                        </a>
                                                                      </div>
                                                                  </div>
                                                                  </li>`)
                                            if (is_added) {
                                                $(`div[data-id='l-${i}']`).append(`<a class="dropdown-item" href="#!">
                                                                                        <i class="fas fa-bell"></i>
                                                                                        <span>Hat??rlat??c??dan kald??r</span>
                                                                                    </a>`)
                                            } else {
                                                $(`div[data-id='l-${i}']`).append(`<a class="dropdown-item" href="#!">
                                                                                        <i class="fas fa-bell"></i>
                                                                                        <span>Hat??rlat??c??ya ekle</span>
                                                                                    </a>`)
                                            }
                                        } else {
                                            $(".res-l-ul").append(`<li data-id="${i}">
                                                                  <a class="incorrect" href="" data-id="res-word">${word}</a>
                                                                  <div class="dropdown">
                                                                      <button class="btn-dd"
                                                                              type="button" id="dropdownResL" data-toggle="dropdown"
                                                                              aria-haspopup="true" aria-expanded="false">
                                                                        <img src="{% static 'img/menu.png' %}" alt="Menu">
                                                                      </button>
                                                                      <div data-id="l-${i}" class="dropdown-menu" aria-labelledby="dropdownResL">
                                                                        <a target="_blank" class="dropdown-item" href="/s??zl??k/q=${word}">
                                                                            <i class="fa fa-search"></i>
                                                                            S??zl??kte arat
                                                                        </a>
                                                                        <a target="_blank" class="dropdown-item" href="/kelime_listesi/q=${word}">
                                                                                <i class="fas fa-clipboard-list"></i>
                                                                                Listende g??r??nt??le
                                                                        </a>
                                                                      </div>
                                                                  </div>
                                                                  </li>`)
                                            if (is_added) {
                                                $(`div[data-id='l-${i}']`).append(`<a class="dropdown-item" href="#!">
                                                                                        <i class="fas fa-bell"></i>
                                                                                        <span>Hat??rlat??c??dan kald??r</span>
                                                                                    </a>`)
                                            } else {
                                                $(`div[data-id='l-${i}']`).append(`<a class="dropdown-item" href="#!">
                                                                                        <i class="fas fa-bell"></i>
                                                                                        <span>Hat??rlat??c??ya ekle</span>
                                                                                    </a>`)
                                            }
                                        }
                                    }
                                    $(".confirm-3").modal("hide")
                                    $(".quiz-finish-l").remove()
                                    $("a[data-id='res-word']").click(function(e){
                                        e.preventDefault()
                                        var target = $(this).parent().attr("data-id")
                                        $("a[data-id='l']").eq(target).click()
                                    })
                                    setTimeout(function() {
                                        $("a[aria-controls='res-l']").click()
                                    }, 4)
                                })
                                $(document).on("click", ".confirm-no-3", function(e) {
                                    e.preventDefault()
                                    $(".confirm-3").modal("hide")
                                })
                                $(".quiz-question:first").find(".chevron-left[data-id='l']").remove()
                                $(".quiz-question:last").find(".chevron-right[data-id='l']").remove()
                            }
                        }
                    })
                    $(".modal-body-content-l").fadeIn()
                }
            } else {
                $(".quiz-err-l").remove()
                ths.after(`<div class="quiz-err-l mt-1">* G??nl??k Quiz haklar??n??z?? tamamlam????s??n??z.
                                                            Yar??n tekrar gelin!</div>`)
            }
            }, 40)
        }
    }
})

$(document).on("click", '.chevron-left', function() {
    id_ = $(this).attr("data-id")
    var target = parseInt( $(this).parent().parent().attr("data-no") ) - 2
    $(`a[data-id=${id_}]`).eq(target).click()
})

$(document).on("click", '.chevron-right', function() {
    id_ = $(this).attr("data-id")
    var target = parseInt( $(this).parent().parent().attr("data-no") )
    $(`a[data-id=${id_}]`).eq(target).click()
})

$(document).keydown(function(e){
    if (e.keyCode == 37) {
        $("div.active").find(".chevron-left").click()
        setTimeout(function() {
            $("div.active").find(".quiz-answer").focus()
        }, 4)
    } else if (e.keyCode == 39) {
        $("div.active").find(".chevron-right").click()
        setTimeout(function() {
            $("div.active").find(".quiz-answer").focus()
        }, 4)
    }
})

function mediaContainer(container) {
  if (container.matches) {
    $(".container-media").addClass("container")
  } else {
    $(".container-media").removeClass("container")
  }
}
var container = window.matchMedia("(min-width:576px)")
mediaContainer(container)
container.addListener(mediaContainer)

async function refL() {
    var result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "{% url 'quiz-and-refresh' %}",
            data: {
                'random-learned': "refresh",
            },
            dataType: 'json',
            success: function(data) {
                if (data.random_learned) {
                    var ref;
                    var quiz;
                    setTimeout(function() {
                        $(".ul-learned").empty()
                        $(".title-l").css("z-index", "-1").html("")
                        ref = $(".ref-img-l").detach()
                        $("button[data-target='#quiz-l']").html("")
                    },700)
                    setTimeout(function() {
                        $(".title-l").css("z-index", "initial").html("????rendiklerim")
                        $(".ref-l").prepend(ref)
                        $("button[data-target='#quiz-l']").html("Quiz")
                        data.random_learned.map(function(i) {
                            $(".ul-learned").append(`<li><a class="teal" href="/s??zl??k/q=${i}/">${i}</a></li>`)
                        })
                    },1800)
                }
            }
        })
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function refUnl() {
    var result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "{% url 'quiz-and-refresh' %}",
            data: {
                'random-unlearned': "refresh",
            },
            dataType: 'json',
            success: function(data) {
                if (data.random_unlearned) {
                    var ref;
                    var quiz;
                    setTimeout(function() {
                        $(".ul-unlearned").empty()
                        $(".title-unl").css("z-index", "-1").html("")
                        ref = $(".ref-img-unl").detach()
                        $("button[data-target='#quiz-unl']").html("")
                    },700)
                    setTimeout(function() {
                        $(".title-unl").css("z-index", "initial").html("????reneceklerim")
                        $(".ref-unl").prepend(ref)
                        $("button[data-target='#quiz-unl']").html("Quiz")
                        data.random_unlearned.map(function(i) {
                            $(".ul-unlearned").append(`<li><a class="teal" href="/s??zl??k/q=${i}/">${i}</a></li>`)
                        })
                    },1800)
                }
            }
        })
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function refDb() {
    var result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "quiz-and-refresh",
            data: {
                'random-db': 'refresh',
            },
            dataType: 'json',
            success: function(data) {
                if (data.random_db) {
                    var ref;
                    var quiz;
                    setTimeout(function() {
                        $(".ul-db").empty()
                        $(".title-db").css("z-index", "-1").html("")
                        ref = $(".ref-img-db").detach()
                        $("button[data-target='#quiz-db']").html("")
                    },700)
                    setTimeout(function() {
                        $(".title-db").css("z-index", "initial").html("Biliyor muydun?")
                        $(".ref-db").prepend(ref)
                        $("button[data-target='#quiz-db']").html("Quiz")
                        data.random_db.map(function(i) {
                            $(".ul-db").append(`<li><a class="teal" href="/s??zl??k/q=${i}/">${i}</a></li>`)
                        })
                    },1800)
                }
            }
        })

        return result;
    } catch (error) {
        console.error(error);
    }
}

$(".ref").click(function() {
    var ths = $(this)
    if (ths.hasClass('ref-l')) {
        if (ths.parents().eq(3).hasClass("flip-card")) {
            ths.parents().eq(3).removeClass("flip-card")
        } else {
            ths.parents().eq(3).addClass("flip-card")
        }
        refL()
    } else if (ths.hasClass('ref-unl')) {
        if (ths.parents().eq(3).hasClass("flip-card")) {
            ths.parents().eq(3).removeClass("flip-card")
        } else {
            ths.parents().eq(3).addClass("flip-card")
        }
        refUnl()
    }
    else if (ths.hasClass('ref-db')) {
        if (ths.parents().eq(3).hasClass("flip-card")) {
            ths.parents().eq(3).removeClass("flip-card")
        } else {
            ths.parents().eq(3).addClass("flip-card")
        }
        refDb()
    }
})

$("span.audio").click(function() {
    $(this).parent().next()[0].play()
})

$(".add-btn-home").on("click", function(){
    var ths = $(this)
    var no = ths.attr('data-id')
    var en = $("#word_" + no + "> span").text().trim()
    var tr_list = []
    ths.parent().parent().prev().children().map(function(){
        tr_list.push($(this).text().toLowerCase().trim())
    })
    var audio = $("#au-" + no).attr("src")

    if ( !(isNaN(no)) ) {
        if (ths.hasClass("btn-before")) {
            $.ajax({
                type:"GET",
                url: "/word_cd",
                data:{
                   "word_en": en,
                   "tr": tr_list,
                   "audio": audio
                },
                success: function(data) {
                    stopNotif()
                    $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html("Kelime eklendi!")
                    notifHide()
                    ths.toggleClass("btn-before btn-after")
                    $.ajax({
                        type:"GET",
                        url: "{% url 'prg-tracker' %}",
                        data:{
                           "ach_no": [4, 14],
                           "up_or_down": 1,
                        }
                    })
                }
            })

        } else if (ths.hasClass("btn-after")) {
            $.ajax({
                 type:"GET",
                 url: "/word_cd",
                 data:{
                    "word_en": en,
                    "tr": tr_list,
                    "audio": audio
                 },
                 success: function(data) {
                    stopNotif()
                    $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html("Kelime silindi!")
                    notifHide()
                    ths.toggleClass("btn-after btn-before")
                    $.ajax({
                        type:"GET",
                        url: "{% url 'prg-tracker' %}",
                        data:{
                           "ach_no": [4, 14],
                           "up_or_down": 0,
                        }
                    })
                 }
            })
        }
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