$(document).ready(function() {

  var check_detail_name = function() {
    var input=$(this);
    var is_name=input.val()
    if(is_name){
      input.parent().removeClass("has-error").addClass("has-success");
      input.next('span').removeClass("error_show").addClass("error");
    }
    else{
      input.parent().removeClass("has-success").addClass("has-error");
      input.next('span').removeClass("error").addClass("error_show");
    }
  };

  $('#last_name').on('input', check_detail_name);
  $('#first_name').on('input', check_detail_name);
  $('#phone').on('input', check_detail_name);

  $('#email').on('input', function() {
    var input=$(this);
    var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    var is_email=re.test(input.val());
    if(is_email){
      input.parent().removeClass("has-error").addClass("has-success");
      input.next('span').removeClass("error_show").addClass("error");
    }
    else{
      input.parent().removeClass("has-success").addClass("has-error");
      input.next('span').removeClass("error").addClass("error_show");
    }
  });

  var detail_check_before_submit = function(event){
    var form_data=$("#p_detail");
    var error_free=true;
    form_data.children('div').each(function(){
        var error = $(this).hasClass("has-error");
        var error_element=$(this).find("span");
        if (error){error_element.removeClass("error").addClass("error_show"); error_free=false;}
        else {
          error_element.removeClass("error_show").addClass("error");
        }
    })
    if (!error_free){
      alert('請填寫基本資料。');
    }
    else{
      var p_detail = {
        title: $("#title option:selected").text(),
        last_name: $("#last_name").val(),
        first_name: $("#first_name").val(),
        email: $("#email").val(),
        phone: $("#phone").val(),
      }
      var activities = new Array();
      $("table tr.tmp_table").each(function(){
        var activity = {
          id: $(this).attr('name'),
          time: $(this).find("[name='time']").text(),
          ad_count: $(this).find("[name='ad_count']").val(),
          ch_count: $(this).find("[name='ch_count']").val(),
        }
        activities.push(activity)
      })

      $.ajax({
        type: "POST",
        url: "/send/form",
        // The key needs to match your method's input parameter (case-sensitive).
        data: JSON.stringify({detail: p_detail, activity_list: activities}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){alert(data+' 請儘快與您的旅遊經紀人聯繫');},
        failure: function(errMsg) {
            alert(errMsg);
        }
      });
    }

  };

  $('#send').on('click', detail_check_before_submit)
  var ac_list
  $.get("/get/activity",function(result){
      ac_list = result.ac_list;
      for (var i = 0; i < ac_list.length; i++) {
        $("#location").append("<option value="+i+">"+ac_list[i].location+"</option>" );
      };
    });

  $("#location").on("change", function() {
    $("#ac_name").find("optgroup.tmp_list").remove().end();
    $("#ac_name").find("option.tmp_list").remove().end();
    var act_list = ac_list[$(this).val()].act_list;
    var company = "";
    var id;
    for (var i = 0; i < act_list.length; i++) {
      if (company != act_list[i].company){
        company = act_list[i].company;
        id = 'optg' + i;
        $("#ac_name").append('<optgroup id="'+id+'" class="tmp_list" label="'+company+'"></optgroup>');
      }
      $("#"+id).append('<option class="tmp_list" value='+i+">"+act_list[i].activity+"("+act_list[i].time+")"+"</option>" );
    };
  });

  $("#join").click(function(){
    $a = $('#ac_name option.tmp_list')
    if ($a.is($a) == false){
      warning('請選擇地點。');
      return;
    }
    var check = false;
    $a.each(function() {
      if($(this).is(':selected')){
        check = true;
        var date = $("#date").val();
        if (date == ''){
          warning('請選擇日期。');
          return;
        }
        var user_ac = {
          "date": $("#date").val(),
          "time": $("#time option:selected").text(),
          "location": $("#location").val(),
          "ac_name": $("#ac_name").val(),
          };
        show_table(user_ac);
        success_msg('成功加入活動。');
      }
    });
    if (check == false){
      warning('請選擇活動。');
    }
  });

  var warning = function(statement){
    $("div #warning").find('*').remove().end();
    $("div #warning").append('<div class="alert alert-danger" role="alert">'+
      '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>'+
      '<span class="sr-only">Error:</span> Warning! '+statement+'</div>');
  };

  var deposit_warning = function() {
    $("#deposit_warning").find('*').remove().end();
    $("#deposit_warning").append('<div class="alert alert-info" role="alert">'+
      '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>'+
      '您有預付訂金項目，活動公司要求提供信用卡作為出席活動擔保，請向您的旅遊經紀人告知您的信用卡卡號及有效期'+
      '</div>');

  };

  var success_msg = function(statement){
    $("div #warning").find('*').remove().end();
    $("div #warning").append('<div class="alert alert-success" role="alert">'+
      '<span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span>'+
      '<span class="sr-only">Success:</span> Success! '+statement+'</div>');
  };

  var show_table = function(user_ac){
    $("div #warning").find('*').remove().end();
    var act = ac_list[user_ac.location].act_list[user_ac.ac_name]
    $(".table").append(
      '<tr class="tmp_table" name="'+user_ac.location+'-'+user_ac.ac_name+'">'+
        '<td class="table-id-code"><button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button></td>'+
        '<td class="table-date-time" name="time">'+user_ac.date+' '+user_ac.time+'</td>'+
        '<td>'+act.activity+'('+act.time+')'+'</td>'+
        '<td class="table-money">'+act.web_adult+'</td>'+
        '<td class="table-money">'+act.web_child+'</td>'+
        '<td class="table-money">'+act.KTL_adult+'</td>'+
        '<td class="table-money">'+act.KTL_child+'</td>'+
        '<td><input class="count" type="text" name="ad_count" value="0" style="width: 20px; text-align: right"></td>'+
        '<td><input class="count" type="text" name="ch_count" value="0" style="width: 20px; text-align: right"></td>'+
        '<td class="table-money" name="sub_total">0.00</td>'+
        '<td class="table-money" name="sub_nopay_total">0.00</td>'+
      '</tr>'
      );
  };

  var deposit = false;
  var recount = function(){

    var sub_all = 0;
    var to_pay = 0;
    var all_total = 0;
    var all_to_pay = 0;
    var length = $("tr.tmp_table").length;
    var ad_count = 0;
    var ch_count = 0;
    for (var i = 1; i <= $("tr.tmp_table").length; i++) {
      $tmp_tr = $(".table").find("tr:nth-child("+(i+2)+")");
      var ac= $tmp_tr.attr('name').split("-")
      var act = ac_list[ac[0]].act_list[ac[1]];
      ad_count = $tmp_tr.find("[name='ad_count']").val();
      ch_count = $tmp_tr.find("[name='ch_count']").val();
      sub_all = ad_count * act.KTL_adult + ch_count * act.KTL_child
      all_total = all_total + sub_all
      if (act.pay_deposit_ad == ""){ // 全額預付
        to_pay = sub_all
      }
      else{ // 預付訂金
        deposit = true
        to_pay = ad_count * act.pay_deposit_ad + ch_count * act.pay_deposit_ch
      }
      $tmp_tr.find("[name='sub_total']").text(to_pay.toFixed(2));
      $tmp_tr.find("[name='sub_nopay_total']").text((sub_all - to_pay).toFixed(2));

      all_to_pay = all_to_pay + to_pay;
    };
    $("#all_total").text(all_total.toFixed(2));
    $("#pay_total").text(all_to_pay.toFixed(2));
    $("#no_pay_total").text((all_total - all_to_pay).toFixed(2));

    if (deposit) {
      deposit_warning()
    }
  }

  $("input[name=pay_way]").change(function(){
    $("div #pay_way").find('*').remove().end();
    var value = $(this).val()
    var template = _.template('<div class="panel panel-default">'+
                '<div class="panel-heading">'+
                  '<h3 class="panel-title"></h3><%= title %></div>'+
                '<div class="panel-body"><%= body %></div></div>')
    if (value == 'option1') {
      $("div #pay_way").append(template({title:'紐西蘭國內帳戶',
          body: 'Account Name: New Zealand Kate Travel Co Ltd<br>'+
                'Account Number: 01-0190-0277878-00<br>'+
                'Swift Code: ANZBNZ22<br>'+
                'Name of the bank: ANZ Bank New Zealand Ltd<br>'+
                'Branch Address: Corner of Cavendish Drive & Lambie Drive, Manukau, Auckland, New Zealand<br>'+
                '請再向旅遊經紀人確認預定單無誤後儘快完成匯款手續，收到帳款即開始處理您的訂單'
        }))
    }
    if (value == 'option2') {
      var total = $("#pay_total").text();
      total = total * 1.01;
      $("div #pay_way").append(template({title:'信用卡付款',
          body: '將收取1%手續費，收取金額將為  NZD '+total.toFixed(2)+'<br>請向您的旅遊經紀人告知您的卡號及有效期'
        }));
    }

  });

  $(document).on('click', 'button.close', function () { // <-- changes
     $(this).closest('tr').remove();
  });
  $(document).on('keyup', 'input.count', recount);
  $(document).on('click', 'input.count', function(){
      $(this).select()
  });

});
