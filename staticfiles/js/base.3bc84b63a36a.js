window.onscroll = function() {scrollFunction()}
function scrollFunction() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    $(".scroll_top").css("display", "block")
  } else {
    $(".scroll_top").css("display", "none")
  }
}

$(document).on("click", "a.dropdown-item", function() {
    var ths = $(this)
    var text = ths.parent().parent().prev().text()
    if (ths.find("span").html() === "Hatırlatıcıya ekle") {
        $.ajax({
            type:"GET",
            url: "/reminder/",
            data: {
                'word': text,
                'add 2 reminder': true,
            },
            dataType: 'json',
            success: function(data) {
                stopNotif()
                $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html("Hatırlatıcıya eklendi!")
                notifHide()
                ths.find("span").html("Hatırlatıcıdan kaldır")
            }
        })
    } else if (ths.find("span").html() === "Hatırlatıcıdan kaldır") {
        $.ajax({
            type:"GET",
            url: "/reminder/",
            data: {
                'word': text,
                'remove from reminder': true,
            },
            dataType: 'json',
            success: function(data) {
                stopNotif()
                $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html("Hatırlatıcıdan kaldırıldı!")
                notifHide()
                var attr = ths.parent().attr("data-reminder")
                if ( typeof attr !== typeof undefined && attr !== false ) {
                    ths.parent().parent().parent().remove()
                } else {
                    ths.find("span").html("Hatırlatıcıya ekle")
                }
            }
        })
    }
})

function closeCustomization() {
    if ($('.customization').hasClass("customization-modal")) {
        $(document).click(function(e) {
            if ( $(e.target).closest('.customization').length === 0 && !($(e.target).hasClass("fixed-top")) ) {
                $(".times-customization").click()
                $(".tools-backdrop-c").remove()
            }
        })
    }
}

$(document).click(function(){
    closeCustomization()
})

async function getCustomizationAjax() {
    let result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "/get_customization/",
            data: {
                'get-customization': "get-customization",
            },
            dataType: 'json',
            success: function(data) {
                data_owned_colors = data.owned_colors
                data_owned_bg_imgs = data.owned_bg_imgs
                data_owned_colors.map(function(obj, i){
                    owned_colors.push({
                        "pdt_text": obj.owned_pdt_text,
                        "pdt_id": obj.pdt_id
                    })
                })
                data_owned_bg_imgs.map(function(obj, i){
                    owned_bg_imgs.push({
                        "pdt_text": obj.owned_pdt_text,
                        "pdt_id": obj.pdt_id
                    })
                })
            }
        })

        return result;
    } catch (error) {
        console.error(error);
    }
}

$(".customization").click(function(){
    if (is_authenticated == "True") {
        var ths = $(this)
        if ( !(ths.hasClass("customization-modal")) ) {
            setTimeout(function(){
                $("body").append("<div class='modal-backdrop tools-backdrop-c fade show'></div>")
            }, 4)
            owned_colors = []
            owned_bg_imgs = []
            getCustomizationAjax()
            setTimeout(function(){
                ths.addClass("customization-modal py-4 px-sm-4 px-2").find("img").remove()
                setTimeout(function(){
                    ths.append(`
                        <div class="title-customization">
                            <span>Kişiselleştirme</span>
                            <img src="/static/img/customization.png" alt="Kişiselleştirme">
                        </div>
                        <div class="modal-body modal-body-customization">
                        <div role="tabpanel">
                            <ul class="nav nav-tabs">
                                <li>
                                    <a class="nav-link active" data-toggle="tab" href=".customization-tab">
                                        <img src="/static/img/customization.png" alt="Kişiselleştirme">
                                    </a>
                                </li>
                            </ul>
                            <div class="tab-content">
                                <div class="customization-tab tab-pane active m-2">
                                    <div class="d-flex justify-content-end">
                                      <div>
                                        <button class="return_to_def custom_def">Varsayılan ayarlara dön</button>
                                      </div>
                                    </div>
                                    <div class="customizationAccordion">
                                      <div>Renkler</div>
                                      <i class="fas pointer caret fa-caret-down align-self-center"></i>
                                    </div>
                                    <ul class="color-list"></ul>
                                    <div class="customizationAccordion">
                                      <div>Arka planlar</div>
                                      <i class="fas pointer caret fa-caret-down align-self-center"></i>
                                    </div>
                                    <ul class="bg-img-list"></ul>
                                </div>
                            </div>
                        </div>
                        <div class="times times-customization pointer"><span>&times;</span></div>
                    `)
                    if (owned_colors.length) {
                        owned_colors.map(function(obj, i){
                            $("ul.color-list").append(`
                                <li>
                                    <div>${obj.pdt_text}</div>
                                    <div class="d-flex" style="margin-left:10px" data-id="${obj.pdt_id}">
                                        <button class="customBtnApply custom_btn_navbar">menü</button>
                                        <button class="customBtnApply custom_btn_bg_clr">arka plan</button>
                                    </div>
                                </li>
                            `)
                        })
                    } else {
                        $("ul.color-list").append("<div class='custom_abs_li'>Marketten bir renk satın aldığında burada gösterilir.</div>")
                    }
                    if (owned_bg_imgs.length) {
                        owned_bg_imgs.map(function(obj, i){
                            $("ul.bg-img-list").append(`
                                <li>
                                    <div>${obj.pdt_text}</div>
                                    <div class="d-flex" style="margin-left:10px" data-id="${obj.pdt_id}">
                                        <button class="customBtnApply custom_btn_bg_img">uygula</button>
                                    </div>
                                </li>
                            `)
                        })
                    } else {
                        $("ul.bg-img-list").append("<div class='custom_abs_li'>Marketten bir resim satın aldığında burada gösterilir.</div>")
                    }
                }, 700)
            }, 40)
        }
    } else {
        $("#loginModal").modal()
    }
})

$(document).on("click", ".caret", function(){
    var ths = $(this)
    if (ths.parent().hasClass("active")) {
        ths.toggleClass("fa-caret-down fa-caret-up")
        ths.parent().next().toggle("slide", { direction: "up" })
        ths.parent().removeClass("active")
    } else {
        ths.toggleClass("fa-caret-up fa-caret-down")
        ths.parent().next().toggle("slide", { direction: "up" })
        ths.parent().addClass("active")
    }
})

function closeAchievs() {
    if ($('.achievs').hasClass("achievs-modal")) {
        $(document).click(function(e) {
            if ( $(e.target).closest('.achievs').length === 0 && !($(e.target).hasClass("fixed-top")) ) {
                $(".times-achievs").click()
                $(".tools-backdrop-a").remove()
            }
        })
    }
}

$(document).click(function(){
    closeAchievs()
})

async function getAchievsAjax() {
    let result;

    try {
        result = await $.ajax({
                type:"GET",
                url: "/get_achievs/",
                data: {
                    'get-achievs': "get-achievs",
                },
                dataType: 'json',
                success: function(data) {
                    acc_coin = data.acc_coin
                    data.ach_list.map(function(i){
                        ach_list.push({
                            "ach_text": i.ach_text,
                            "ach_coin": i.ach_coin,
                            "ach_daily": i.ach_daily,
                            "ach_prg_max": i.ach_prg_max
                        })
                    })
                    data.ach_tracker_list.map(function(i){
                        ach_tracker_list.push({
                            "prg_current": i.prg_current,
                            "prg_percentage": i.prg_percentage,
                            "prg_star": i.prg_star
                        })
                    })
                    data.pdt_list.map(function(i){
                        pdt_list.push({
                            "pdt_text": i.pdt_text,
                            "pdt_price": i.pdt_price,
                            "pdt_type": i.pdt_type,
                            "pdt_color": i.pdt_color,
                            "pdt_bg_img": i.pdt_bg_img,
                            "pdt_id": i.pdt_id,
                            "is_purchased": i.is_purchased
                        })
                    })
                }
            })

        return result;
    } catch (error) {
        console.error(error);
    }
}

$(".achievs").click(function(){
    if (is_authenticated == "True") {
        var ths = $(this)
        if ( !(ths.hasClass("achievs-modal")) ) {
            setTimeout(function(){
                $("body").append("<div class='modal-backdrop tools-backdrop-a fade show'></div>")
            }, 4)
            ach_list = []
            ach_tracker_list = []
            pdt_list = []
            acc_coin = 0
            getAchievsAjax()
            setTimeout(function(){
                ths.addClass("achievs-modal py-4 px-sm-4 px-2").find("img").remove()
                setTimeout(function(){
                    ths.append(`
                                <div class="title-achievs">
                                    <span>Başarılar</span>
                                    <img src="/static/img/başarılar.png" alt="Başarılar">
                                </div>
                                <div class="modal-body modal-body-achievs">
                                <div role="tabpanel">
                                    <ul class="nav nav-tabs">
                                        <li>
                                            <a class="nav-link active" data-toggle="tab" href=".achievs-tab">
                                                <i class="fas fa-trophy"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a class="nav-link" data-toggle="tab" href=".shop-tab">
                                                <i class="fas fa-shopping-cart"></i>
                                            </a>
                                        </li>
                                    </ul>
                                    <div class="tab-content">
                                        <input style="position:absolute;left:-20px" id="achievs-tp-cb" type="checkbox">
                                        <div class="achievs-tab tab-pane active">
                                        <div class="achievs-daily text-center achievs-da-show">
                                            <span>GÜNLÜK BAŞARILAR</span>
                                            <div class="achievements-table">
                                                <div>
                                                  <div class="goal-sect">
                                                    <div><div class="goal-text"></div></div>
                                                    <div>
                                                      İlerleme
                                                      <div class="progress-bar-custom" data-prg-id="1">
                                                        <div>
                                                          <span class="prg_cur"></span>/<span class="prg_max"></span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div class="stars">
                                                    <div>
                                                      <img src="/static/img/ezber-coin.png" width="21px" height="21px" alt="Ezber Coin">
                                                      <span class="coin_value"></span>
                                                    </div>
                                                    <div>
                                                      <div class="star-wrapper" data-ach-no="1">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div>
                                                  <div class="goal-sect">
                                                    <div><div class="goal-text"></div></div>
                                                    <div>
                                                      İlerleme
                                                      <div class="progress-bar-custom" data-prg-id="2">
                                                        <div>
                                                          <span class="prg_cur"></span>/<span class="prg_max"></span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div class="stars">
                                                    <div>
                                                      <img src="/static/img/ezber-coin.png" width="21px" height="21px" alt="Ezber Coin">
                                                      <span class="coin_value"></span>
                                                    </div>
                                                    <div>
                                                      <div class="star-wrapper" data-ach-no="2">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div>
                                                  <div class="goal-sect">
                                                    <div><div class="goal-text"></div></div>
                                                    <div>
                                                      İlerleme
                                                      <div class="progress-bar-custom" data-prg-id="3">
                                                        <div>
                                                          <span class="prg_cur"></span>/<span class="prg_max"></span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div class="stars">
                                                    <div>
                                                      <img src="/static/img/ezber-coin.png" width="21px" height="21px" alt="Ezber Coin">
                                                      <span class="coin_value"></span>
                                                    </div>
                                                    <div>
                                                      <div class="star-wrapper" data-ach-no="3">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div>
                                                  <div class="goal-sect">
                                                    <div><div class="goal-text"></div></div>
                                                    <div>
                                                      İlerleme
                                                      <div class="progress-bar-custom" data-prg-id="4">
                                                        <div>
                                                          <span class="prg_cur"></span>/<span class="prg_max"></span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div class="stars">
                                                    <div>
                                                      <img src="/static/img/ezber-coin.png" width="21px" height="21px" alt="Ezber Coin">
                                                      <span class="coin_value"></span>
                                                    </div>
                                                    <div>
                                                      <div class="star-wrapper" data-ach-no="4">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                            </div>
                                            <div class="achievs-tp text-center">
                                                <label for="achievs-tp-cb">
                                                  <div><span style="cursor:pointer">Genel Başarılar</span></div>
                                                  <i class="fas fa-long-arrow-alt-right"></i>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="achievs-general achievs-ga-dis translate-right text-center">
                                            <span>GENEL BAŞARILAR</span>
                                            <div class="achievements-table">
                                                <div>
                                                  <div class="goal-sect">
                                                    <div><div class="goal-text"></div></div>
                                                    <div>
                                                      İlerleme
                                                      <div class="progress-bar-custom" data-prg-id="5">
                                                        <div>
                                                          <span class="prg_cur"></span>/<span class="prg_max"></span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div class="stars">
                                                    <div>
                                                      <img src="/static/img/ezber-coin.png" width="21px" height="21px" alt="Ezber Coin">
                                                      <span class="coin_value"></span>
                                                    </div>
                                                    <div>
                                                      <div class="star-wrapper" data-ach-no="5">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                      <div class="star-wrapper" data-ach-no="5">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                      <div class="star-wrapper" data-ach-no="5">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div>
                                                  <div class="goal-sect">
                                                    <div><div class="goal-text"></div></div>
                                                    <div>
                                                      İlerleme
                                                      <div class="progress-bar-custom" data-prg-id="6">
                                                        <div>
                                                          <span class="prg_cur"></span>/<span class="prg_max"></span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div class="stars">
                                                    <div>
                                                      <img src="/static/img/ezber-coin.png" width="21px" height="21px" alt="Ezber Coin">
                                                      <span class="coin_value"></span>
                                                    </div>
                                                    <div>
                                                      <div class="star-wrapper" data-ach-no="8">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                      <div class="star-wrapper" data-ach-no="8">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                      <div class="star-wrapper" data-ach-no="8">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div>
                                                  <div class="goal-sect">
                                                    <div><div class="goal-text"></div></div>
                                                    <div>
                                                      İlerleme
                                                      <div class="progress-bar-custom" data-prg-id="7">
                                                        <div>
                                                          <span class="prg_cur"></span>/<span class="prg_max"></span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div class="stars">
                                                    <div>
                                                      <img src="/static/img/ezber-coin.png" width="21px" height="21px" alt="Ezber Coin">
                                                      <span class="coin_value"></span>
                                                    </div>
                                                    <div>
                                                      <div class="star-wrapper" data-ach-no="11">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                        <div></div>
                                                      </div>
                                                      <div class="star-wrapper" data-ach-no="11">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                      <div class="star-wrapper" data-ach-no="11">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div>
                                                  <div class="goal-sect">
                                                    <div><div class="goal-text"></div></div>
                                                    <div>
                                                      İlerleme
                                                      <div class="progress-bar-custom" data-prg-id="8">
                                                        <div>
                                                          <span class="prg_cur"></span>/<span class="prg_max"></span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div class="stars">
                                                    <div>
                                                      <img src="/static/img/ezber-coin.png" width="21px" height="21px" alt="Ezber Coin">
                                                      <span class="coin_value"></span>
                                                    </div>
                                                    <div>
                                                      <div class="star-wrapper" data-ach-no="14">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                      <div class="star-wrapper" data-ach-no="14">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                      <div class="star-wrapper" data-ach-no="14">
                                                        <img src="/static/img/star.png" width="30px" height="30px" alt="Yıldız">
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                            </div>
                                            <div class="achievs-tp text-center">
                                                <label for="achievs-tp-cb">
                                                  <div><span style="cursor:pointer">Günlük Başarılar</span></div>
                                                  <i class="fas fa-long-arrow-alt-left"></i>
                                                </label>
                                            </div>
                                        </div>
                                        </div>
                                        <div class="shop-tab tab-pane text-center">
                                            <div class="shop-panel row"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="balance-wrapper">
                                  <div class="balance">
                                    <img src="/static/img/ezber-coin.png" width="21px" height="21px" alt="Ezber Coin">
                                    <span></span>
                                  </div>
                                </div>
                                <div class="rem-tt">
                                    <i class="fas fa-question-circle"></i>
                                    <div class="tooltip-content">
                                        <div><i class="fas fa-trophy"></i>Günlük ve Genel Başarılar</div>
                                        <div>
                                          <i class="fas fa-shopping-cart"></i>
                                            Ezber coin'leri harcayarak özellik açabileceğin mağaza
                                        </div>
                                    </div>
                                </div>
                                <div class="times times-achievs pointer"><span>&times;</span></div>
                                </div>`)
                    prg_max_list = []
                    ach_list.map(function(obj, i){
                        $(".goal-text").eq(i).html(obj.ach_text)
                        $(".stars span").eq(i).html(obj.ach_coin)
                        $(".progress-bar-custom").eq(i).find("span").eq(1).html(obj.ach_prg_max)
                        prg_max_list.push(obj.ach_prg_max)
                    })
                    $(".balance span").html(acc_coin)
                    $(".achievs-daily").after(`<style></style>`)
                    ach_tracker_list.map(function(obj, i){
                      $("style").append(`[data-prg-id="${i+1}"]::before {
                                             width: ${obj.prg_percentage}%
                                        }`)
                      $(".progress-bar-custom").eq(i).find("span").eq(0).html(obj.prg_current)
                      if (i < 4) {
                        if (obj.prg_star === 0) {
                          $("img[alt='Yıldız']").eq(i).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i).parent().addClass("collect")
                          }
                        }
                      } else if (i === 4) {
                        if (obj.prg_star === 0) {
                          $("img[alt='Yıldız']").eq(i).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+1).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+2).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i).parent().addClass("collect")
                          }
                        } else if (obj.prg_star === 1) {
                          $("img[alt='Yıldız']").eq(i+1).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+2).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i+1).parent().addClass("collect")
                          }
                        } else if (obj.prg_star === 2) {
                          $("img[alt='Yıldız']").eq(i+2).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i+2).parent().addClass("collect")
                          }
                        }
                      } else if (i === 5) {
                        if (obj.prg_star === 0) {
                          $("img[alt='Yıldız']").eq(i+2).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+3).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+4).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i+2).parent().addClass("collect")
                          }
                        } else if (obj.prg_star === 1) {
                          $("img[alt='Yıldız']").eq(i+3).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+4).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i+3).parent().addClass("collect")
                          }
                        } else if (obj.prg_star === 2) {
                          $("img[alt='Yıldız']").eq(i+4).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i+4).parent().addClass("collect")
                          }
                        }
                      } else if (i === 6) {
                        if (obj.prg_star === 0) {
                          $("img[alt='Yıldız']").eq(i+4).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+5).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+6).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i+4).parent().addClass("collect")
                          }
                        } else if (obj.prg_star === 1) {
                          $("img[alt='Yıldız']").eq(i+5).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+6).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i+5).parent().addClass("collect")
                          }
                        } else if (obj.prg_star === 2) {
                          $("img[alt='Yıldız']").eq(i+6).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i+6).parent().addClass("collect")
                          }
                        }
                      } else if (i === 7) {
                        if (obj.prg_star === 0) {
                          $("img[alt='Yıldız']").eq(i+6).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+7).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+8).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i+6).parent().addClass("collect")
                          }
                        } else if (obj.prg_star === 1) {
                          $("img[alt='Yıldız']").eq(i+7).addClass("gscale-on")
                          $("img[alt='Yıldız']").eq(i+8).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i+7).parent().addClass("collect")
                          }
                        } else if (obj.prg_star === 2) {
                          $("img[alt='Yıldız']").eq(i+8).addClass("gscale-on")
                          if (obj.prg_current >= prg_max_list[i]) {
                            $("img[alt='Yıldız']").eq(i+8).parent().addClass("collect")
                          }
                        }
                      }
                    })
                    pdt_list.map(function(obj, i){
                        $(".shop-panel").append(`<div class="shop_pdt col-sm-4 col-12" data-id="${obj.pdt_id}">
                                                    <div class="pdt-text">${obj.pdt_text}</div>
                                                    <div class="pdt-price">
                                                      <img src="/static/img/ezber-coin.png" width="21px" height="21px" alt="Ezber Coin">
                                                      ${obj.pdt_price}
                                                    </div>
                                                    <div class="pdt-footer"></div>
                                                </div>`)
                        if (obj.pdt_type === "clr") {
                            $(".shop_pdt").eq(i).addClass("shop_pdt_clr")
                            $(".pdt-footer").eq(i).prepend(`<button class="pdt-pv">ön izle</button>`)
                            $(".pdt-text").eq(i).html(`
                                <span style='color:${obj.pdt_color}'>${obj.pdt_text}</span>
                                rengini satın al
                            `)
                        } else if (obj.pdt_type === "bg-img") {
                            $(".shop_pdt").eq(i).addClass("shop_pdt_bg")
                            $(".pdt-footer").eq(i).prepend(`<button class="pdt-pv">ön izle</button>`)
                            $(".pdt-text").eq(i).html(`
                                <span style="color:#2e3039">${obj.pdt_text}</span>
                                arka plan resmini satın al
                            `)
                        } else if (obj.pdt_type === "rights") {
                            $(".shop_pdt").eq(i).addClass("shop_pdt_rights")
                            $(".pdt-text").eq(i).html(`
                                <span style="color:#2e3039">${obj.pdt_text}</span>
                                quiz'ine ekstra 1 hak satın al
                            `)
                        }
                        if (obj.is_purchased) {
                            $(".pdt-footer").eq(i).append(`<button class="pdt-buy purchased"></button>`)
                        } else {
                            $(".pdt-footer").eq(i).append(`<button class="pdt-buy"></button>`)
                        }
                    })
                }, 700)
            }, 40)
        }
    } else {
        $("#loginModal").modal()
    }
})

$(document).on("click", ".return_to_def", function(){
    if ($(this).hasClass("custom_def")) {
        $.ajax({
            type:"POST",
            url: "/customization/",
            data:{
                "custom_bg_navbar": 1,
                'csrfmiddlewaretoken' : csrf_token
            },
            success: function(data) {
                $(".icon-bar a").css("cssText", "background: #008080")
                $("#menu").css("cssText", "background: #008080")
                $(".ber").css("cssText", "color: #008080")
                $("body").css("cssText", "background-color: #008080")
            }
        })
    }
})

$(document).on("click", ".pdt-buy:not(.purchased)", function(){
    var pdt_id = $(this).parent().parent().attr("data-id")
    var ths = $(this)
    $.ajax({
        type:"GET",
        url: "/shop_purchase/",
        data: {
            "pdt_id": pdt_id
        },
        dataType: 'json',
        success: function(data){
            if (data.is_purchased) {
                stopNotif()
                $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span")
                .html("Satın alma başarılı!")
                notifHide()
                $(`<div class='coin-inc'>-${data.pdt_price}</div>`).appendTo(".balance-wrapper").addClass("coin-inc-anim")
                setTimeout(function(){
                    $(".coin-inc").eq(0).remove()
                    $(".balance span").html(data.cur_balance)
                }, 500)
                ths.addClass("purchased")
            } else {
                stopNotif()
                if (data.gap) {
                    $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html(
                    `Satın alma başarısız. <br> ${data.gap} coin'e daha ihtiyacın var!`)
                    notifHide()
                } else {
                    $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html(
                    `Satın alma başarısız. <br> Lütfen tekrar deneyin.`)
                    notifHide()
                }
            }
        },
        error: function() {
            stopNotif()
            $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html(
            `Satın alma başarısız. <br> Lütfen tekrar deneyin.`)
            notifHide()
        }
    })
})

$(document).on("click", ".customBtnApply", function(){
    var pdt_id = $(this).parent().attr("data-id")
    if (pdt_id) {
        if ($(this).hasClass("custom_btn_navbar")) {
            $.ajax({
                type:"POST",
                url: "/customization/",
                data:{
                   "pdt_id": pdt_id,
                   "custom_navbar_color": 1,
                   'csrfmiddlewaretoken' : csrf_token
                },
                success: function(data) {
                    $(".icon-bar a").css("cssText", `background: ${data.pdt_color}`)
                    $("#menu").css("cssText", `background: ${data.pdt_color}`)
                    $(".ber").css("cssText", `color: ${data.pdt_color}`)
                }
            })
        } else if ($(this).hasClass("custom_btn_bg_clr")) {
            $.ajax({
                type:"POST",
                url: "/customization/",
                data:{
                   "pdt_id": pdt_id,
                   "custom_background_color": 1,
                   'csrfmiddlewaretoken' : csrf_token
                },
                success: function(data) {
                    $("body").css("cssText", `background-color: ${data.pdt_color} !important`)
                }
            })
        } else if ($(this).hasClass("custom_btn_bg_img")) {
            $.ajax({
                type:"POST",
                url: "/customization/",
                data:{
                   "pdt_id": pdt_id,
                   "custom_background_image": 1,
                   'csrfmiddlewaretoken' : csrf_token
                },
                success: function(data) {
                    $("body").css("cssText", `background-image: url(https://ezberle.herokuapp.com/static/img/${data.pdt_image}) !important;
                                              background-size: 40%`)
                }
            })
        }
    }
})

$(document).on("click", ".pdt-pv", function(){
    var pdt_id = $(this).parent().parent().attr("data-id")
    $.ajax({
        type:"GET",
        url: "/shop_preview/",
        data: {
            "pdt_id": pdt_id
        },
        dataType: 'json',
        success: function(data) {
            if (data.pdt_color) {
                $("body").css("cssText", `background: ${data.pdt_color} !important`)
                $(".icon-bar a").css("cssText", `background: ${data.pdt_color}`)
                $("#menu").css("cssText", `background: ${data.pdt_color}`)
                $(".ber").css("cssText", `color: ${data.pdt_color}`)
            } else if (data.pdt_bg_img) {
                $("body").css("cssText", `background-image: url(https://ezberle.herokuapp.com/static/img/${data.pdt_bg_img}) !important;
                                          background-size: 40%`)
            }
        }
    })
})

async function starAjax(ths) {
    let result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "/prg_tracker/",
            data: {
                "ach_no": [ach_no],
                "prg_star": "",
            },
            dataType: 'json',
            statusCode: {
                200: function (data) {
                    $(`<div class='coin-inc'>+${data.coin_value}</div>`).appendTo(".balance-wrapper").addClass("coin-inc-anim")
                    setTimeout(function(){
                        $(".coin-inc").eq(0).remove()
                        $(".balance span").html(data.cur_balance)
                        ths.parent().removeClass("collect")
                    }, 500)
                    var cur = ths.parent().parent().parent().prev().find(".prg_cur")
                    var max = ths.parent().parent().parent().prev().find(".prg_max")
                    var ach_text = ths.parent().parent().parent().prev().find(".goal-text")
                    var coin_value = ths.parent().parent().prev().find(".coin_value")
                    prg_max = data.prg_max
                    ths.parent().addClass("star-collected star-collected-anim")
                    if (ach_no > 4 && ths.parent().next().length) {
                        cur.html("0")
                        max.html(prg_max)
                        ach_text.html(data.ach_text)
                        coin_value.html(data.next_coin_value)
                        if (ach_no === 5) {
                         $("style").append(`[data-prg-id="5"]::before {
                                            width: 0%
                                          }`)
                        } else if (ach_no === 8) {
                         $("style").append(`[data-prg-id="6"]::before {
                                            width: 0%
                                          }`)
                        } else if (ach_no === 11) {
                         $("style").append(`[data-prg-id="7"]::before {
                                            width: 0%
                                          }`)
                        } else if (ach_no === 14) {
                         $("style").append(`[data-prg-id="8"]::before {
                                            width: 0%
                                          }`)
                        }
                    } else {
                        var max = parseInt(ths.parent().parent().parent().prev().find(".prg_max").text())
                        cur.html(max)
                    }
                    setTimeout(function(){
                        ths.parent().removeClass("star-collected-anim")
                    }, 1000)
                }
            }
        })

        return result;
    } catch (error) {
        console.error(error);
    }
}

$(document).on("click", "img[alt='Yıldız']", function(){
    var ths = $(this)
    if (ths.parent().hasClass("collect")) {
        ach_no = parseInt(ths.parent().attr("data-ach-no"))
        prg_max = 0
        starAjax(ths)
    }
})

$(document).on('change', '#achievs-tp-cb', function(){
    if(!event.detail || event.detail == 1) {
        if ( !($("style").text().includes("animation")) ) {
            $("style").append(`
              .achievs-da-show {
                animation: achievs-da-show 1.5s 1s both
              }
              .achievs-da-dis {
                animation: achievs-da-dis 1.5s both
              }
              .achievs-ga-show {
                animation: achievs-ga-show 1.5s 1s both
              }
              .achievs-ga-dis {
                animation: achievs-ga-dis 1.5s both
              }
            `)
        }
        var daily = $(this).next().find(".achievs-daily")
        var general = $(this).next().find(".achievs-general")
        daily.toggleClass("achievs-da-show achievs-da-dis")
        general.toggleClass("achievs-ga-dis achievs-ga-show")
        setTimeout(function(){
            general.removeClass("translate-right")
        }, 2500)
    }
})

$(document).on("click", "a[href='.achievs-tab']", function(){
    $(".title-achievs").find("span").html("Başarılar")
    .end().find("img").remove()
    .end().append(`<img src="/static/img/başarılar.png" alt="Başarılar">`)
})

$(document).on("click", "a[href='.shop-tab']", function(){
    $(".title-achievs").find("span").html("Market")
    .end().find("img").remove()
    .end().append(`<img src="/static/img/shopping-cart.png" alt="Market">`)
})

function openReminder() {
    if ( !($(".reminder").hasClass("reminder-modal")) ) {
        $(".reminder").click()
        $.ajax({
            type:"GET",
            url: "/open_reminder/",
            dataType: 'json',
        })
    }
}

setTimeout(function(){
    if (is_authenticated == "True") {
        if (open_reminder == "False" && reminder_count > 0) {
            openReminder()
        }
    }
}, 5000)

function closeReminder() {
    if ($('.reminder').hasClass("reminder-modal")) {
        $(document).click(function(e) {
            if ( $(e.target).closest('.reminder').length === 0 && !($(e.target).hasClass("fixed-top")) ) {
                $(".times-rem").click()
                $(".tools-backdrop-r").remove()
            }
        })
    }
}

$(document).click(function(){
    closeReminder()
})

async function getReminderAjax(args) {
    let result;

    try {
        result = await $.ajax({
            type:"GET",
            url: "/get_reminder/",
            data: {
                'get-reminder': "get-reminder",
            },
            dataType: 'json',
            success: function(data) {
                list = data.reminder_list
                new_words = data.new_in_reminder_list
                new_words.map(function(i){
                    new_words_reminder.push(i)
                })
                list.map(function(i){
                    word_list.push(i)
                })
                quiz_db = data.quiz_db
                quiz_db.map(function(i){
                    quiz_db_list.push(i)
                })
                quiz_unl = data.quiz_unl
                quiz_unl.map(function(i){
                    quiz_unl_list.push(i)
                })
                quiz_l = data.quiz_l
                quiz_l.map(function(i){
                    quiz_l_list.push(i)
                })
            }
        })

        return result;
    } catch (error) {
        console.error(error);
    }
}

$(".reminder").click(function(){
    if (is_authenticated == "True") {
        var ths = $(this)
        if ( !(ths.hasClass("reminder-modal")) ) {
            setTimeout(function(){
                $("body").append("<div class='modal-backdrop tools-backdrop-r fade show'></div>")
            }, 4)
            word_list = []
            new_words_reminder = []
            quiz_db_list = []
            quiz_unl_list = []
            quiz_l_list = []
            getReminderAjax()
            setTimeout(function(){
                ths.addClass("reminder-modal py-4 px-sm-4 px-2").find("img").remove()
                setTimeout(function(){
                    ths.append(`
                                <div class="title-reminder">
                                    <span>Hatırlatıcı</span>
                                    <img src="/static/img/reminder.svg" alt="Hatırlatıcı">
                                </div>
                                <div class="modal-body modal-body-reminder">
                                <div role="tabpanel">
                                    <ul class="nav nav-tabs">
                                        <li>
                                            <a class="nav-link active" data-toggle="tab" href="#kelimeler">
                                                <i class="fas fa-list-ol"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a class="nav-link" data-toggle="tab" href=".quiz-1">
                                                <i class="material-icons">filter_1</i>
                                            </a>
                                        </li>
                                        <li>
                                            <a class="nav-link" data-toggle="tab" href=".quiz-2">
                                                <i class="material-icons">filter_2</i>
                                            </a>
                                        </li>
                                        <li>
                                            <a class="nav-link" data-toggle="tab" href=".quiz-3">
                                                <i class="material-icons">filter_3</i>
                                            </a>
                                        </li>
                                    </ul>
                                    <div class="tab-content">
                                        <div id="kelimeler" class="tab-pane active text-center">
                                            <ul class="modal-list"></ul>
                                        </div>
                                        <div class="tab-pane quiz-1 text-center">
                                            <ul class="modal-list"></ul>
                                        </div>
                                        <div class="tab-pane quiz-2 text-center">
                                            <ul class="modal-list"></ul>
                                        </div>
                                        <div class="tab-pane quiz-3 text-center">
                                            <ul class="modal-list"></ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="rem-tt">
                                    <i class="fas fa-question-circle"></i>
                                    <div class="tooltip-content">
                                        <div><i class="fas fa-list-ol"></i>Hatırlatıcıya kaydedilmiş kelimeler</div>
                                        <div><i class="material-icons">filter_1</i>En son olduğun "Öğreneceğim Kelimeler" quizinin sonuçları</div>
                                        <div><i class="material-icons">filter_2</i>En son olduğun "Öğrendiğim Kelimeler" quizinin sonuçları</div>
                                        <div><i class="material-icons">filter_3</i>En son olduğun "Biliyor muydun?" quizinin sonuçları</div>
                                    </div>
                                </div>
                                <div class="times times-rem pointer"><span>&times;</span></div>
                                </div>`)
                                if (word_list.length > 0) {
                                    word_list.map(function(i){
                                        if (new_words_reminder.includes(i)) {
                                            $("#kelimeler").find($(".modal-list"))
                                               .append(`<li class="new">
                                                  <span>${i}</span>
                                                  <div class="dropdown">
                                                      <button class="btn-dd"
                                                              type="button" id="dropdownReminder" data-toggle="dropdown"
                                                              aria-haspopup="true" aria-expanded="false">
                                                        <img src="/static/img/menu.png" alt="Menu">
                                                      </button>
                                                      <div class="dropdown-menu" data-reminder="true" aria-labelledby="dropdownReminder">
                                                        <a target="_blank" class="dropdown-item" href="/sözlük/q=${i}">
                                                            <i class="fa fa-search"></i>
                                                            <span>Sözlükte arat</span>
                                                        </a>
                                                        <a target="_blank" class="dropdown-item" href="/kelime_listesi/q=${i}">
                                                            <i class="fas fa-clipboard-list"></i>
                                                            <span>Listende görüntüle</span>
                                                        </a>
                                                        <a class="dropdown-item" href="#!">
                                                            <i class="fas fa-bell"></i>
                                                            <span>Hatırlatıcıdan kaldır</span>
                                                        </a>
                                                      </div>
                                                  </div>
                                               </li>`)
                                        } else {
                                            $("#kelimeler").find($(".modal-list"))
                                               .append(`<li>
                                                  <span>${i}</span>
                                                  <div class="dropdown">
                                                      <button class="btn-dd"
                                                              type="button" id="dropdownReminder" data-toggle="dropdown"
                                                              aria-haspopup="true" aria-expanded="false">
                                                        <img src="/static/img/menu.png" alt="Menu">
                                                      </button>
                                                      <div class="dropdown-menu" data-reminder="true" aria-labelledby="dropdownReminder">
                                                        <a target="_blank" class="dropdown-item" href="/sözlük/q=${i}">
                                                            <i class="fa fa-search"></i>
                                                            <span>Sözlükte arat</span>
                                                        </a>
                                                        <a target="_blank" class="dropdown-item" href="/kelime_listesi/q=${i}">
                                                            <i class="fas fa-clipboard-list"></i>
                                                            <span>Listende görüntüle</span>
                                                        </a>
                                                        <a class="dropdown-item" href="#!">
                                                            <i class="fas fa-bell"></i>
                                                            <span>Hatırlatıcıdan kaldır</span>
                                                        </a>
                                                      </div>
                                                  </div>
                                               </li>`)
                                        }
                                    })
                                } else {
                                    $("#kelimeler").find($(".modal-list"))
                                                       .append(`<li>
                                                                  <span>Hatırlatıcıya kelime kaydettiğinde burada gösterilir.</span>
                                                                </li>`)
                                }
                                if (quiz_unl_list.length > 0) {
                                    $(".quiz-1").prepend(`<h6 class="d-flex justify-content-end mt-2">Son olduğun quiz'in tarihi: ${quiz_unl_list[0]['create_time']}</h6>`)
                                    quiz_unl_list.map(function(i){
                                        if (i.is_correct) {
                                            $(".quiz-1").find("ul").append(`<li>
                                                                          <span class="correct">${i.english}</span>
                                                                          <div class="dropdown">
                                                                              <button class="btn-dd"
                                                                                      type="button" id="dropdownReminder" data-toggle="dropdown"
                                                                                      aria-haspopup="true" aria-expanded="false">
                                                                                <img src="/static/img/menu.png" alt="Menu">
                                                                              </button>
                                                                              <div class="dropdown-menu" data-reminder="true" aria-labelledby="dropdownReminder">
                                                                                <a target="_blank" class="dropdown-item" href="/sözlük/q=${i.english}">
                                                                                    <i class="fa fa-search"></i>
                                                                                    <span>Sözlükte arat</span>
                                                                                </a>
                                                                                <a target="_blank" class="dropdown-item" href="/kelime_listesi/q=${i.english}">
                                                                                    <i class="fas fa-clipboard-list"></i>
                                                                                    <span>Listende görüntüle</span>
                                                                                </a>
                                                                              </div>
                                                                          </div>
                                                                        </li>`)
                                        } else {
                                            $(".quiz-1").find("ul").append(`<li>
                                                                          <span class="incorrect">${i.english}</span>
                                                                          <div class="dropdown">
                                                                              <button class="btn-dd"
                                                                                      type="button" id="dropdownReminder" data-toggle="dropdown"
                                                                                      aria-haspopup="true" aria-expanded="false">
                                                                                <img src="/static/img/menu.png" alt="Menu">
                                                                              </button>
                                                                              <div class="dropdown-menu" data-reminder="true" aria-labelledby="dropdownReminder">
                                                                                <a target="_blank" class="dropdown-item" href="/sözlük/q=${i.english}">
                                                                                    <i class="fa fa-search"></i>
                                                                                    <span>Sözlükte arat</span>
                                                                                </a>
                                                                                <a target="_blank" class="dropdown-item" href="/kelime_listesi/q=${i.english}">
                                                                                    <i class="fas fa-clipboard-list"></i>
                                                                                    <span>Listende görüntüle</span>
                                                                                </a>
                                                                              </div>
                                                                          </div>
                                                                        </li>`)
                                        }
                                    })
                                } else {
                                    $(".quiz-1").find($(".modal-list"))
                                                       .append(`<li>
                                                                  <span>"Öğreneceğim Kelimeler" listesinden olduğun son quizin sonuçları burada gösterilir.</span>
                                                                </li>`)
                                }

                                if (quiz_l.length > 0) {
                                    $(".quiz-2").prepend(`<h6 class="d-flex justify-content-end mt-2">Son olduğun quiz'in tarihi: ${quiz_l_list['create_time']}</h6>`)
                                    quiz_l_list.map(function(i){
                                        if (i.is_correct) {
                                            $(".quiz-2").find("ul").append(`<li>
                                                                          <span class="correct">${i.english}</span>
                                                                          <div class="dropdown">
                                                                              <button class="btn-dd"
                                                                                      type="button" id="dropdownReminder" data-toggle="dropdown"
                                                                                      aria-haspopup="true" aria-expanded="false">
                                                                                <img src="/static/img/menu.png" alt="Menu">
                                                                              </button>
                                                                              <div class="dropdown-menu" data-reminder="true" aria-labelledby="dropdownReminder">
                                                                                <a target="_blank" class="dropdown-item" href="/sözlük/q=${i.english}">
                                                                                    <i class="fa fa-search"></i>
                                                                                    <span>Sözlükte arat</span>
                                                                                </a>
                                                                                <a target="_blank" class="dropdown-item" href="/kelime_listesi/q=${i.english}">
                                                                                    <i class="fas fa-clipboard-list"></i>
                                                                                    <span>Listende görüntüle</span>
                                                                                </a>
                                                                              </div>
                                                                          </div>
                                                                        </li>`)
                                        } else {
                                            $(".quiz-2").find("ul").append(`<li>
                                                                          <span class="incorrect">${i.english}</span>
                                                                          <div class="dropdown">
                                                                              <button class="btn-dd"
                                                                                      type="button" id="dropdownReminder" data-toggle="dropdown"
                                                                                      aria-haspopup="true" aria-expanded="false">
                                                                                <img src="/static/img/menu.png" alt="Menu">
                                                                              </button>
                                                                              <div class="dropdown-menu" data-reminder="true" aria-labelledby="dropdownReminder">
                                                                                <a target="_blank" class="dropdown-item" href="/sözlük/q=${i.english}">
                                                                                    <i class="fa fa-search"></i>
                                                                                    <span>Sözlükte arat</span>
                                                                                </a>
                                                                                <a target="_blank" class="dropdown-item" href="/kelime_listesi/q=${i.english}">
                                                                                    <i class="fas fa-clipboard-list"></i>
                                                                                    <span>Listende görüntüle</span>
                                                                                </a>
                                                                              </div>
                                                                          </div>
                                                                        </li>`)
                                        }
                                    })
                                } else {
                                    $(".quiz-2").find("ul").append(`<li>
                                                                        <span>"Öğrendiğim Kelimeler" listesinden olduğun son quizin sonuçları burada gösterilir.</span>
                                                                    </li>`)
                                }
                                if (quiz_db.length > 0) {
                                    $(".quiz-3").prepend(`<h6 class="d-flex justify-content-end mt-2">Son olduğun quiz'in tarihi: ${quiz_db_list[0]['create_time']}</h6>`)
                                    quiz_db_list.map(function(i){
                                        if (i.is_correct) {
                                            $(".quiz-3").find("ul").append(`<li>
                                                                              <span class="correct">${i.english}</span>
                                                                              <a target="_blank" href="/sözlük/q=${i.english}">
                                                                                <i class="fa fa-search"></i>
                                                                              </a>
                                                                            </li>`)
                                        } else {
                                            $(".quiz-3").find("ul").append(`<li>
                                                                              <span class="incorrect">${i.english}</span>
                                                                              <a target="_blank" href="/sözlük/q=${i.english}">
                                                                                <i class="fa fa-search"></i>
                                                                              </a>
                                                                            </li>`)
                                        }
                                    })
                                } else {
                                    $(".quiz-3").find("ul").append(`<li>
                                                                        <span>"Biliyor muydun?" listesinden olduğun son quizin sonuçları burada gösterilir.</span>
                                                                    </li>`)
                                }

                }, 700)
            }, 40)
        }
    } else {
        $("#loginModal").modal()
    }
})

$(document).on("click", ".times", function(){
    var ths = $(this)
    var gParent = ths.parent().parent()
    ths.prev().remove()
    gParent.find("div[role]").remove()
    if (ths.hasClass("times-achievs")) {
        gParent.find(".title-achievs").remove()
        gParent.removeClass("achievs-modal py-4 px-sm-4 px-2")
        setTimeout(function(){
            gParent.append(`<img src="/static/img/başarılar.png" alt="Başarılar">`)
        }, 40)
        $(".modal-body-achievs").remove()
        ths.remove()
    } else if (ths.hasClass("times-rem")) {
        gParent.find(".title-reminder").remove()
        gParent.removeClass("reminder-modal py-4 px-sm-4 px-2")
        gParent.append(`<img src="/static/img/reminder.svg" alt="Hatırlatıcı">`)
        $(".modal-body-reminder").remove()
        ths.remove()
    } else if (ths.hasClass("times-customization")) {
        gParent.find(".title-customization").remove()
        gParent.removeClass("customization-modal py-4 px-sm-4 px-2")
        gParent.append(`<img src="/static/img/customization.png" alt="Kişiselleştirme">`)
        $(".modal-body-customization").remove()
        ths.remove()
    }
})

$(".scroll_top").click(function(){
    topFunction()
})

function topFunction() {
  document.body.scrollTop = 0
  document.documentElement.scrollTop = 0
}

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

$(document).on("click", "i[title='Dinle']", function(){
    if ($("#ajax_audio").length > 0) {
        $("#ajax_audio")[0].play()
    }
})

$(document).click(function(e) {
    if ( $(e.target).closest('.ajax_word_info').length === 0 ) {
        $(".ajax_word_info").eq(0).remove()
    }
})

var selection_text;
var width;
$(document.body).bind('mouseup', function(e){
    if (e.which === 1) {
        var sel;
        globalThis.x;
        globalThis.left;
        var y;
        if (window.getSelection) {
            sel = window.getSelection();
            var oRange;
            if (sel) {
                oRange = sel.getRangeAt(0);
            }
            oRect = oRange.getBoundingClientRect();
            width = Math.round( (Math.round(oRect.width) - 45)  / 2)
            left = Math.round( (Math.round(oRect.width) - 302)  / 2)
            height = Math.round(oRect.height) + 8
            x = Math.round(oRect.x + window.scrollX) + "px"
            y = Math.round(oRect.y + window.scrollY) + "px"
        }
        if ( !($(".ajax_word_info").length) ) {
            sel.toString().split("volume")[0].trim() !== '' &&
            $(`<div class='ajax_word_info'></div>`).appendTo($(this))
            $(`<div class='ajax_word_info'>
                <div class="ajax_word_div"></div>
                <button class="ajax_word_btn"><i class="fab fa-readme oldlace"></i></button>
            </div>`).css("top", `${parseInt(y)+height}px`).css("left", `${parseInt(x)+width}px`).appendTo($(this))
            selection_text = sel
        }
    }
});

$(document).on("click", ".ajax_word_btn", function(){
    if(!event.detail || event.detail == 1) {
        ths = $(this)
        ths.fadeOut("500")
        setTimeout(function(){
            $(".ajax_word_info").append(`<div class="sk-chase">
                                          <div class="sk-chase-dot"></div>
                                          <div class="sk-chase-dot"></div>
                                          <div class="sk-chase-dot"></div>
                                          <div class="sk-chase-dot"></div>
                                          <div class="sk-chase-dot"></div>
                                          <div class="sk-chase-dot"></div>
                                        </div>`)
        }, 600)
        $.ajax({
            type:"GET",
            url: "/ajax_word_info/",
            data: {
                'selection': selection_text.toString().split("volume")[0].trim(),
            },
            dataType: 'json',
            success: function(data) {
                if (!('success' in data)) {
                    $(".ajax_word_info").prepend('<div class="drag"></div>')
                    setTimeout(function(){
                        $(".sk-chase").remove()
                    }, 40)
                    $(".ajax_word_info").css("left", `${parseInt(x)+width-Math.abs(left)}px`).css("padding", "5px").draggable({ zIndex: 300, cursor: 'move', containment:$(".wrapper"), handle: '.drag' })
                    $(".ajax_word_div").addClass("p-3").css("width", "292px").css("height", "300px").append(`<table class="ajax_word_table">
                                                                                             <tr>
                                                                                                <th>Kelime</th>
                                                                                                <th>Hece</th>
                                                                                                <th>Telaffuz</th>
                                                                                                <th>Dinle</th>
                                                                                             </tr>
                                                                                             <tr>
                                                                                                <td>${data.word}</td>
                                                                                                <td>${data.syllables}</td>
                                                                                                <td>${data.pronunciation}</td>
                                                                                                <td class="audio"></td>
                                                                                             </tr>
                                                                                           </table>`)
                    if (data.audio != "None") {
                        $("td.audio").append(`
                                            <i title="Dinle" class="fas fa-volume-up"></i>
                                            <audio id="ajax_audio" src="${data.audio}"></audio>
                                            `)
                    } else { $("td.audio").append(`
                                                <i title="Ses mevcut değil" class="material-icons">volume_off</i>
                                                <audio src=""></audio>
                                                `)
                    }
                    if (data.tr != "None") {
                        $(".ajax_word_div").append(`<div>
                                                    <strong>Türkçeleri:</strong>
                                                    <ul id="ajaxTrUl"></ul>
                                                 </div>`)
                        data.tr.map(function(i){
                            $("#ajaxTrUl").append(`<li>${i}</li>`)
                        })
                    }
                    data.all_results.map(function(i){
                        no = data.all_results.indexOf(i)
                        $(".ajax_word_div").append(`
                            <div data-ajax-id="${no}"></div>
                        `)
                        if (i["definition"]) {
                            $(`div[data-ajax-id=${no}]`).append(`<div>
                                                                    <strong>Tanım:</strong> <br>
                                                                    ${i["definition"]}
                                                                </div>`)
                        }
                        if (i["partOfSpeech"]) {
                            $(`div[data-ajax-id=${no}]`).append(`<div>
                                                                    <strong>Sözcük türü:</strong> <br>
                                                                    ${i["partOfSpeech"]}
                                                                </div>`)
                        }
                        if (i["synonyms"]) {
                            $(`div[data-ajax-id=${no}]`).append(`<div>
                                                                    <strong>Eş anlamlıları:</strong>
                                                                    <div class="d-flex flex-wrap" data-syn-id="${no}">
                                                                    </div>
                                                                </div>`)
                            i["synonyms"].map(function(x){
                                $(`div[data-syn-id=${no}]`).append(`<a href="/sözlük/q=${x}" target="_blank">${x}</a>`)
                            })
                        }
                        if (i["antonyms"]) {
                            $(`div[data-ajax-id=${no}]`).append(`<div>
                                                                    <strong>Zıt anlamlıları:</strong>
                                                                    <div class="d-flex flex-wrap" data-anto-id="${no}">
                                                                    </div>
                                                                </div>`)
                            i["antonyms"].map(function(x){
                                $(`div[data-anto-id=${no}]`).append(`<a href="/sözlük/q=${x}" target="_blank">${x}</a>`)
                            })
                        }
                        if (i["examples"]) {
                            $(`div[data-ajax-id=${no}]`).append(`<div>
                                                                    <strong>Örnek Cümleler:</strong>
                                                                    <ul data-ex-id="${no}">
                                                                    </ul>
                                                                </div>`)
                            i["examples"].map(function(x){
                                $(`ul[data-ex-id=${no}]`).append(`<li>${x}</li>`)
                            })
                        }
                    })
                } else {
                    stopNotif()
                    $(".notif").addClass("notif-show").append(`<div class="notif-timer"></div>`).find("span").html("Kelime hakkında sonuç bulunamadı!")
                    notifHide()
                    setTimeout(function(){
                        $(".ajax_word_info").remove()
                    }, 600)
                }
            }
        })
    }
})