async function startQuiz(type) {
    var result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "/get_count/",
            data: {
                [`count_${type}`]: 1,
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

$(".object-content[data-toggle='modal']").click(function(){
    switch($(this).attr("data-target")) {
        case "#quiz-unl":
            var type = "unl"
            break
        case "#quiz-l":
            var type = "l"
            break
        case "#quiz-db":
            var type = "db"
            break
    }
    $.ajax({
        type:"GET",
        url: "/get_count/",
        data: {
            [`count_${type}`]: 1,
        },
        dataType: 'json',
        success: function(data) {
            $(`#count_${type}`).html(data.count)
            $(`.quiz_${type}_rights`).html(data.quiz_rights)
        }
    })
})

$(".object-content").hover(
    function(){
        $(this).find("img").attr("src", "/static/img/ref-arrow-white.png")
    },
    function(){
        $(this).find("img").attr("src", "/static/img/ref-arrow-ired.png")
    },
)

$(".start").click(function() {
    if(!event.detail || event.detail == 1) {
        var ths = $(this)
        if (ths.hasClass("start-db")) {
            var type = "db"
        } else if (ths.hasClass("start-unl")) {
            var type = "unl"
        } else if (ths.hasClass("start-l")) {
            var type = "l"
        }
        var quiz_rights = parseInt( $(`.quiz_${type}_rights`).html() )

        var count = parseInt($(`#count_${type}`).html())
        var value = $(`#sel-${type}`).val()
        var gap = value - count

        if ( quiz_rights > 0 && gap < 0 ) {
            $.ajax({
                type:"POST",
                url: "/complete_quiz/",
                data: {
                    [`quiz-${type}`]: 1,
                    "csrfmiddlewaretoken" : csrf_token
                },
                dataType: 'json',
            })
            var correct_list = []
            var incorrect_list = []
            $(`.modal-body-content-${type}`).fadeOut()
            setTimeout(function() {
                $(`.modal-body-content-${type}`).empty()
                $(`.modal-body-${type}`).append(`<div class="loader-wrapper loader-wrapper-${type} center">
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
                    <span>Yükleniyor</span>
                  </div>
                </div>`)
            }, 500)
            $.ajax({
                type:"GET",
                url: "/quiz_and_refresh/",
                data: {
                    [`random-${type}`]: value,
                },
                dataType: 'json',
                success: function(data) {
                    var tr_list = data.tr_list
                    if (data.random_list) {
                        $(`.loader-wrapper-${type}`).remove()
                        $(`.modal-body-content-${type}`).append(`
                            <div role="tabpanel">
                                <ul class="nav nav-tabs-${type}" role="tablist"></ul>
                                <div class="tab-content tab-content-${type}"></div>
                            </div>
                            <div class="modal fade confirm confirm-${type}" tabindex="-1" role="dialog" aria-labelledby="confirm" aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered" role="document">
                                    <div class="modal-content quiz-finish-modal">
                                      <div class="modal-body confirm-text-${type}"></div>
                                      <div class="modal-footer">
                                        <button type="button" class="btn-danger-custom confirm-no-${type}" data-dismiss="confirm">İptal</button>
                                        <button type="button" class="btn-before confirm-ok-${type}">Onayla</button>
                                      </div>
                                    </div>
                                </div>
                            </div>
                        `)
                        $(`.modal-body-content-${type}`).fadeIn()
                        for (i=1;i<=value;i++) {
                          $(`.nav-tabs-${type}`).append(`<li role="presentation" class="nav-item">
                            <a data-id="${type}" class="nav-link" href="#${type}-${i}" aria-controls="${type}-${i}" role="tab" data-toggle="tab">${i}</a>
                            </li>`)
                          $(`.tab-content-${type}`).append(`<div data-no="${i}" role="tabpanel" class="tab-pane" id="${type}-${i}"></div>`)
                        }
                        $(`.nav-tabs-${type}`).find("a").first().click()
                        data.random_list.map(function(i) {
                            var index = data.random_list.indexOf(i) + 1
                            var tr = tr_list[index-1]
                            $(`#${type}-${index}`).append(`
                                <div class="quiz-question mb-2">
                                <button data-id="${type}" class="chevron-left"><i class="fas fa-chevron-left chevron"></i></button>
                                <span class="word-${type} center">${i}</span>
                                <button data-id="${type}" class="chevron-right"><i class="fas fa-chevron-right chevron"></i></button>
                                </div>
                                <div class="d-flex justify-content-center hak")>0/2</div>
                                <div class="d-flex justify-content-center mb-2 mt-1">
                                    <input type="text" class="quiz-answer mr-1" placeholder="Min. 2 harf">
                                    <div class="quiz-result"></div>
                                </div>
                                <div class="d-flex justify-content-center">
                                    <button class="btn-secondary mr-2 quiz-dk-${type}">Bilmiyorum</button>
                                    <button class="btn-before quiz-answer-btn">Cevapla</button>
                                </div>
                                <div class="mt-3 quiz-tr">
                                    <div>Türkçeleri:</div>
                                    <div><ul></ul></div>
                                </div>
                                <div class="quiz-finish-div d-flex justify-content-end"><button class="btn-danger-custom quiz-finish quiz-finish-${type}" data-toggle="confirmation">Quiz'i bitir</button></div>
                            `)
                        })
                        tr_list.map(function(obj, i){
                            if ( !(obj.length) ) {
                                $(".quiz-tr ul").eq(i).append("<u>Kelime'nin Türkçesi bulunamadığı için lütfen bu soruyu boş geçin.</u>")
                            }
                        })
                        $(document).on("click", `.quiz-dk-${type}`, function() {
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
                                    let word = ths.parent().prevAll().eq(2).find("span").text()
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
                        $(document).on("click", `.quiz-finish-${type}`, function() {
                            if ((incorrect_list.length + correct_list.length) < value) {
                                $(`.confirm-text-${type}`).html("Cevaplamadığın sorular var.<br> Quiz'i bitirmek istediğine emin misin?")
                                $(`.confirm-${type}`).modal()
                            } else {
                                $(`.confirm-text-${type}`).html("Quiz'i bitirmek istediğine emin misin?")
                                $(`.confirm-${type}`).modal()
                            }
                        })
                        $(document).on("click", `.confirm-ok-${type}`, function(e) {
                            e.preventDefault()
                            $(document).find(`.quiz-dk-${type}`).click()
                            $.ajax({
                                type:"POST",
                                url: "/save_quiz/",
                                data: {
                                    [`quiz_${type}`]: true,
                                    'correct_list': correct_list,
                                    'incorrect_list': incorrect_list,
                                    'csrfmiddlewaretoken' : csrf_token
                                },
                                dataType: 'json',
                            })
                            $.ajax({
                                type:"GET",
                                url: "/prg_tracker/",
                                data:{
                                   "ach_no": [3, 11],
                                   "up_or_down": 1
                                }
                            })
                            $(`.nav-tabs-${type}`).append(`<li role="presentation" class="nav-item">
                                                        <a data-id="${type}" class="nav-link" href=".res-${type}" aria-controls="res-${type}" role="tab" data-toggle="tab"><i class="fas fa-list-ol"></i></a>
                                                       </li>`)
                            $(`.tab-content-${type}`).append(`<div role="tabpanel" class="tab-pane res-${type}">
                                                            <div>
                                                                <span class="results">Sonuçlar</span>
                                                                ${value} adet sorudan ${correct_list.length} tanesini doğru yaptın.
                                                                <ul class="modal-list res-${type}-ul"></ul>
                                                            </div>
                                                          </div>`)
                            for (let i=0;i<value;i++) {
                                let word = $(document).find(`.word-${type}`).eq(i).text()
                                let is_correct = (correct_list.includes(word)) ? "correct" : "incorrect"
                                    $(`.res-${type}-ul`).append(
                                        `<li data-id="${i}">
                                          <a class="${is_correct}" href="" data-id="res-word">${word}</a>
                                          <div class="dropdown">
                                              <button class="btn-dd"
                                                type="button" id="dropdown${type}" data-toggle="dropdown"
                                                aria-haspopup="true" aria-expanded="false">
                                                <img src="/static/img/menu.png" alt="Menu">
                                              </button>
                                              <div data-id="${type}-${i}" class="dropdown-menu" aria-labelledby="dropdown${type}">
                                                <a target="_blank" class="dropdown-item" href="/sözlük/q=${word}">
                                                  <i class="fa fa-search"></i>
                                                  Sözlükte arat
                                                </a>
                                              </div>
                                          </div>
                                        </li>`
                                    )
                                if (type != "db") {
                                    $.ajax({
                                        type:"GET",
                                        url: "/reminder/",
                                        data: {
                                            'is_added': 1,
                                            'word': word,
                                        },
                                        dataType: 'json',
                                        success: function(data) {
                                            var is_added = data.is_added
                                            var is_added_html = (is_added) ? "Hatırlatıcıdan kaldır" : "Hatırlatıcıya ekle";
                                            $(`div[data-id='${type}-${i}']`).append(`
                                                <a target="_blank" class="dropdown-item" href="/kelime_listesi/q=${word}">
                                                  <i class="fas fa-clipboard-list"></i>
                                                  Listende görüntüle
                                                </a>
                                                <a class="dropdown-item" href="#!">
                                                  <i class="fas fa-bell"></i>
                                                  <span>${is_added_html}</span>
                                                </a>
                                            `)
                                        }
                                    })
                                }
                            }
                            $(`.quiz-finish-${type}`).remove()
                            $("a[data-id='res-word']").click(function(e){
                                e.preventDefault()
                                var target = $(this).parent().attr("data-id")
                                $(`a[data-id='${type}']`).eq(target).click()
                            })
                            $(`.confirm-${type}`).modal("hide")
                            setTimeout(function() {
                                $(`a[aria-controls='res-${type}']`).click()
                            }, 4)
                        })
                        $(document).on("click", `.confirm-no-${type}`, function(e) {
                            e.preventDefault()
                            $(`.confirm-${type}`).modal("hide")
                        })
                        $(".quiz-question:first").find(`.chevron-left[data-id='${type}']`).remove()
                        $(".quiz-question:last").find(`.chevron-right[data-id='${type}']`).remove()
                    }
                }
            })
        } else if (quiz_rights === 0) {
            $(`.quiz-err-${type}`).remove()
            ths.after(`
                <div class="quiz-err-${type} mt-1">* Günlük Quiz haklarınızı tamamlamışsınız.
                Yarın tekrar gelin!</div>
            `)
        } else if (gap > 0) {
            if ( !($(`.quiz-err-${type}`).length) ) {
            ths.after(`<div class="quiz-err-${type} mt-1">* Quiz\'e başlamak için listenizde yeterince kelime bulunmuyor.
                        En az ${gap} kelime daha ekleyip tekrar deneyin.</div>`)
          } else {
            $(`.quiz-err-${type}`).remove()
            ths.after(`<div class="quiz-err-${type} mt-1">* Quiz\'e başlamak için listenizde yeterince kelime bulunmuyor.
                        En az ${gap} kelime daha ekleyip tekrar deneyin.</div>`)
          }
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

async function refresh(type) {
    var result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "/quiz_and_refresh/",
            data: {
                [`random-${type}`]: 'refresh',
            },
            dataType: 'json',
            success: function(data) {
                if (data.random_list) {
                    var ref;
                    var quiz;
                    setTimeout(function() {
                        $(`.ul-${type}`).empty()
                        $(`.title-${type}`).css("z-index", "-1").html("")
                        ref = $(`.ref-img-${type}`).detach()
                        $(`button[data-target='#quiz-${type}']`).html("")
                    },500)
                    setTimeout(function() {
                        $(`.title-${type}`).css("z-index", "initial").html("Biliyor muydun?")
                        $(`.ref-${type}`).prepend(ref)
                        $(`button[data-target='#quiz-${type}']`).html("Quiz")
                        data.random_list.map(function(i) {
                            $(`.ul-${type}`).append(`<li><a class="teal" href="/sözlük/q=${i}/">${i}</a></li>`)
                        })
                    },1600)
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
    if (ths.hasClass("ref-unl")) {
        var type = "unl"
    } else if (ths.hasClass("ref-l")) {
        var type = "l"
    } else if (ths.hasClass("ref-db")) {
        var type = "db"
    }
    if (ths.parents().eq(3).hasClass("flip-card")) {
        ths.parents().eq(3).removeClass("flip-card")
    } else {
        ths.parents().eq(3).addClass("flip-card")
    }
    refresh(type)
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
    var is_add = (ths.hasClass("btn-before")) ? "add" : "delete"
    var is_add_bool = (is_add=="add") ? true : false

    if ( !(isNaN(no)) ) {
        $.ajax({
            type:"GET",
            url: "/word_cd",
            data:{
                "word_en": en,
                "tr": tr_list,
                "audio": audio,
                "is_btn_add": is_add_bool
            },
            success: function(data) {
                if (data.is_added) {
                    notifWordAdded()
                    ths.toggleClass("btn-before btn-after")
                    $.ajax({
                        type:"GET",
                        url: "/prg_tracker/",
                        data:{
                           "ach_no": [4, 14],
                           "up_or_down": 1,
                        }
                    })
                } else if (data.is_deleted) {
                    notifWordDeleted()
                    ths.toggleClass("btn-after btn-before")
                    $.ajax({
                        type:"GET",
                        url: "/prg_tracker/",
                        data:{
                           "ach_no": [4, 14],
                           "up_or_down": 0,
                        }
                    })
                } else if (data.error_msg) {
                    stopNotif()
                    $(".notif").addClass("notif-show success").append(`<div class="notif-timer"></div>`).find("span").html(data.error_msg)
                    ths.toggleClass("btn-before btn-after")
                    notifHide()
                }
            },
            error: function() {
                notifAjaxError()
            }
        })
    }
})

$("span.audio").click(function() {
    $(this).parent().next()[0].play()
})