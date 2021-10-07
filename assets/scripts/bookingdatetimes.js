$(document).ready(function(){
    var travelDates = [];
    var travelDateId = null;
    function LoadBookingDates(){
        $.ajax({
            url: "http://localhost:55932/api/booking/days",
            method: "GET",
            success: function(response_data, status, xhr){
                var data_size = response_data.length;
                var min_date = response_data[0]["TravelDate"];
                min_date = min_date.substring(0, min_date.indexOf("T"));
                min_date = min_date.split("-");
                var max_date = response_data[data_size - 1]["TravelDate"];
                max_date = max_date.substring(0, max_date.indexOf("T"));
                max_date = max_date.split("-");
                travelDates = response_data;
                travelDateId = response_data[0]["Id"];
                $('#datetimepicker4').datetimepicker('minDate', new Date(parseInt(min_date[0]), parseInt(min_date[1])-1, parseInt(min_date[2])));
                $('#datetimepicker4').datetimepicker('maxDate', new Date(parseInt(max_date[0]), parseInt(max_date[1])-1, parseInt(max_date[2])));
                console.log(travelDates);
            },
        })
    }
    LoadBookingDates();

    function AmOrPm(timespan){
        timespan = timespan.toString();
        var ts = timespan.split(":");
        var hours = parseInt(ts[0]);
        var minutes = ts[1];
        var meridiem = " a.m"
        if((hours - 12) >= 0)
           meridiem = " p.m";
        return hours + ":" +minutes + meridiem;
    }

    function LoadTimeSlots(vctrId, travelDateId){
        $.ajax({
            url: "http://localhost:55932/api/booking/times?vctrId="+vctrId+"&travelDateId="+travelDateId,
            method: "GET",
            success: function(response_data, status, xhr){
                if(response_data.length > 0){
                    response_data.forEach(ts => {
                    var tSlot = $('<a href="#" class="dropdown-item times" data-Id='+ts["Id"]+' data-timeslot='+ts["TimeSlot"]+'>'+ AmOrPm(ts['TimeSlot']) +'</a>');
                    $("#timeSlot").siblings(".timeSlots").first().append(tSlot);
                    console.log(AmOrPm(ts['TimeSlot']));
                    });
                }
            }
        });
    }

    $("#timeSlot").on("click", function(){
        $(this).siblings(".timeSlots").first().html("");
        LoadTimeSlots(parseInt($("#vctrId").val()), travelDateId);
        
    });

    $(".timeSlots").on("click", ".times", function(e){
        e.preventDefault();
        e.stopPropagation();
        $("#vehicleCategory-name").text($(this).attr("data-name"));
        $("#vehicleCategory-cost").text($(this).attr("data-cost"));
        booking["VehicleCategoryId"] = parseInt($(this).attr("data-vehicleCategoryId"));
        booking["VehicleCategory"] = $(this).attr("data-name");
        booking["Cost"] = parseInt($(this).attr("data-cost"));
        vctr["VehicleCategoryId"] = parseInt($(this).attr("data-vehicleCategoryId"));
        vctr["VehicleCategory"] = $(this).attr("data-name");
        vctr["Cost"] = parseInt($(this).attr("data-cost"));
        vctr["Id"] = parseInt($(this).attr("data-vctrId"));
        $("#vctrId").val($(this).attr("data-vctrId"));
        $("#timeSlot").click();
    });

    $("#datetimepicker4").on("change.datetimepicker", function(e) {
        let bookingDay = ""+ e.date["_d"].getDate() + "";
        bookingDay = bookingDay.length == 1 ? "0"+bookingDay : bookingDay;
        bookingDate = e.date["_d"].getFullYear()+"-"+(e.date["_d"].getMonth() + 1)+"-"+bookingDay;
        console.log(bookingDate);
        var res = travelDates.filter(obj => Object.values(obj).some(val => val.toString().includes(bookingDate)));
        if(res.length == 1)
           travelDateId = res[0]["Id"];
    });
    $("#testBtn").on("click", function(){
        console.log( "VCTRid = " +$("#vctrId").val());
    });
});