var travelDates = [];
var travelDateId = null;
var vctrtId = null;
$(document).ready(function(){
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
                    var tSlot = $('<a href="#" class="dropdown-item times" data-vctrtId='+ts["VCTRTiD"]+' data-timeslot='+ts["TimeSlot"]+'>'+ AmOrPm(ts['TimeSlot']) +'</a>');
                    $("#timeSlot").siblings(".timeSlots").first().append(tSlot);
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
        // set this event to trigger modal for seat selection
        $("#seat-timeslot").text($(this).text());
        vctrtId = $(this).attr("data-vctrtId")
        $("#timeSlot").click();

        $("#seat-selection").modal("show"); //Seat selection modal shows
    });

    $("#seat-selection").on("shown.bs.modal", function(){
        //perform ajax request
        //populate seat status view
        $.ajax({
            url: "http://localhost:55932/api/booking/seatstatus?travelDayId="+travelDateId+"&vctrtId="+vctrtId,
            method: "GET",
            success: function(response, status, xhr){
                //var seatStatusArrangement = response["ResponseData"];
                var seatStatus = response["SeatStatus"];
                var bookedSeats = seatStatus["BookedSeats"];
                var pendingSeats = seatStatus["PendingSeats"];
                var unBookedSeats = seatStatus["UnBookedSeats"];
                var seats = response["Seats"];
                var rows = response["Rows"];
                var columns = response["Columns"]

                $("#seat-boundary").html("");

                for(let r = 0; r < rows; r++){
                    var row = '<div class="seat-row"></div>';
                    $("#seat-boundary").append(row);
                    for(var c = 0; c < columns; c++){
                        if(seats[r][c] == 0){
                            var noSeat = '<div class="seat-box no-seat"></div>';
                            $("#seat-boundary .seat-row").last().append(noSeat);
                        } else {
                            if(bookedSeats.indexOf(seats[r][c]) != -1)
                              var seat = '<div class="seat-box booked-seat"><div class="seat-number">'+seats[r][c]+'</div></div>';
                            else if(pendingSeats.indexOf(seats[r][c]) != -1)
                              var seat = '<div class="seat-box pending-seat"><div class="seat-number">'+seats[r][c]+'</div></div>';
                            else if(seats[r][c] == 'd')
                              var seat = '<div class="seat-box driver-seat"><div class="seat-number">'+seats[r][c]+'</div></div>';
                            else
                              var seat = '<div class="seat-box unbooked-seat"><div class="seat-number">'+seats[r][c]+'</div></div>';

                            $("#seat-boundary .seat-row").last().append(seat);
                        }
                    }
                }
            }
        });
    });

    $("#seat-boundary").on("click", ".seat-row .unbooked-seat", function(e){
        $("#seat-boundary .seat-row .unbooked-seat").removeClass("selected");
        $(this).addClass("selected");
    })

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