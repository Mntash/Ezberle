$(".footer a").click(function(){
    $("#feedback_modal").modal()
})

$("input[value='Gönder']").click(function(e){
    e.preventDefault()
    var name = $("input[name='isim']").val()
    var lastname = $("input[name='soyisim']").val()
    var feedback = $("textarea").val()
    if (name.length != 0 && lastname.length != 0 && feedback.length != 0) {
        $("form p").remove()
        $("form").append("<div class='d-flex justify-content-center'><div class='loader-fb'>Loading...</div></div>")
        setTimeout(function(){
            $.ajax({
                type:"GET",
                url: "{% url 'save-feedback' %}",
                data: {
                    'name': name,
                    'lastname': lastname,
                    'feedback': feedback
                },
                dataType: 'json',
                success: function(data) {
                    $("form .d-flex").remove()
                    $("form p").remove()
                    $("form").append("<p class='mt-3' style='color: indianred'>Mesajınız gönderilmiştir.</p>")
                }
            })
        }, 100)

    } else {
        $("form p").remove()
        $("form").append("<p class='mt-3' style='color: indianred'>Lütfen tüm alanları doldurun.</p>")
    }
})

$(this).scrollTop(0)
window.onscroll = function() {animateDivs()}
function animateDivs() {
    var slide = window.matchMedia("(min-width:992px)")
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        $(".scroll2top").css("display", "block")
        for (i=0;i<$(".main_home_sect").length-2;i++) {
            function divAnimation(i) {
                if (document.body.scrollTop > 130+(i*440) || document.documentElement.scrollTop > 130+(i*440)) {
                    function mediaAnimation(slide) {
                        if (slide.matches) {
                            $(".main_home_sect").eq(2+i).css("transform", "translate(0)").css("opacity", "1")
                        }
                    }
                    mediaAnimation(slide)
                    slide.addListener(mediaAnimation)
                }
            }
            divAnimation(i)
        }
    } else {
        $(".scroll2top").css("display", "none")
    }
}