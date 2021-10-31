var allTerminals = [];
var transportRoute = {"FromTerminalId" : null, "ToTerminalId" : null, "FromTerminal": null, "ToTerminal": null,
"FromState": "", "ToState": "", "FromCity": "", "ToCity": "", "FromAreaName": "", "ToAreaName": "", "Id": null};
var vctr = {"VehicleCategoryId": null, "TransportRouteId": null, "Cost": null, "Id":null, "VehicleCategory": null};
var vctrTime = {"VCTRId": null, "TimeSlot": null, "Id": null};
var vehicleCategoryTransportRoutes = [];
var bookingDate = null;
var booking = {
    "PaymentReference": "", "CustomerPhone": "", "CustomerEmail": "", "FullName": "", "DVCTRTid": null, "SeatNo" : null
};

var pendingBooking = {
    "TravelDateId": null, "VCTRTid": null, "SeatNo": null, "CustomerPhone": null, "CustomerEmail": null, "FullName": null
};
var minDate;
var maxDate;
$(document).ready(function(){

    $(".terminals-search").on('input', function(){
        LoadTerminals($(this).val(), $(this));
    });

    function LoadTerminals(query, element){
        if((!transportRoute["FromTerminalId"]) || (element.attr("id") == "fromTerminalsSearch")){
            transportRoute["FromTerminalId"] = null;
        }
        $.ajax({
            url: "http://localhost:55932/api/terminals/search?q="+query+"&froId="+ transportRoute["FromTerminalId"],
            method: "GET",
            success: function(response_data, status, xhr){
                allTerminals = response_data["ResponseData"];
                PopTerminals(allTerminals, element.parent());
            },
            error: function(xhr){
                console.log(xhr);
            }
        })
    }

    function PopTerminals(terminalsArray, parent){
        parent.children().not(".selected-terminal, .terminals-search").remove();
        terminalsArray.forEach(terminal => {
            var aTerminal = $('<a href="#" class="list-group-item list-group-item-action terminal-item" data-id=' +terminal["Id"]+' data-city="'+terminal["City"]+'" data-state="'+terminal["State"]+'" data-areaName="'+terminal["AreaName"]+'">'+terminal["State"] + "=>" + terminal["AreaName"]+'</a>');
            // aTerminal.attr("data-cityID", terminal["CityID"]);
            // aTerminal.text(terminal["State"] + "=>" + terminal["AreaName"]);
            parent.append($(aTerminal));
        });
    }

    function GetVehicleCategories(RouteTerminals){
        $.ajax({
            url: "http://localhost:55932/api/TransportRoute/VCTR/RouteTerminalIds?froId="+RouteTerminals["FromTerminalId"]+"&toId="+RouteTerminals["ToTerminalId"],
            method: "GET",
            success: function(response_data, status, xhr){
                vehicleCategoryTransportRoutes = [];
                var VCTRs = response_data["ResponseData"];
                vctr["TransportRouteId"] = VCTRs[0]["TransportRouteId"];
                VCTRs.forEach(element => {
                    vehicleCategoryTransportRoutes.push({"Name" : element["VehicleCategoryName"], "Id": element["Id"],
                    "CategoryId" : element["VehicleCategoryId"], "RouteId": element["TransportRouteId"], "Cost" : element["Cost"]})
                });
                EnableVehicleType();
            }
        })
    }

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
                if(travelDateId == null){
                    travelDateId = response_data[0]["Id"];
                    pendingBooking["TravelDateId"] = travelDateId;
                    console.log(pendingBooking["TravelDateId"] + " hn");
                }
                
                minDate = new Date(parseInt(min_date[0]), parseInt(min_date[1])-1, parseInt(min_date[2]));
                maxDate = new Date(parseInt(max_date[0]), parseInt(max_date[1])-1, parseInt(max_date[2]));
                $('#datetimepicker4').datetimepicker('minDate', new Date(parseInt(min_date[0]), parseInt(min_date[1])-1, parseInt(min_date[2])));
                $('#datetimepicker4').datetimepicker('maxDate', new Date(parseInt(max_date[0]), parseInt(max_date[1])-1, parseInt(max_date[2])));
            },
        })
    }
    //LoadBookingDates();

    $(".personal-info").on('input', function(){
        booking[$(this).attr("id")] = $(this).val();
    })

    $(".terminal-group").on('click', '.terminal-item', function(e){
        e.preventDefault();
        e.stopPropagation();
        var siblingInput = $(this).siblings("input.terminals-search").first();
        siblingInput.val("");
        $(this).siblings(".selected-terminal").first().text($(this).text());
        $(this).siblings(".selected-terminal").first().attr("data-id", $(this).attr("data-id"));
        $(this).siblings(".selected-terminal").first().attr("data-city", $(this).attr("data-city"));
        $(this).siblings(".selected-terminal").first().attr("data-state", $(this).attr("data-state"));
        $(this).siblings(".selected-terminal").first().attr("data-areaName", $(this).attr("data-areaName"));
        $(this).siblings().not(".selected-terminal, .terminals-search").remove();
        $("#toTerminalsSearch").removeAttr('disabled');
        $(this).remove();
        transportRoute["FromTerminalId"] = $("#fromTerminalsSearch").siblings(".selected-terminal").first().attr("data-id");
        transportRoute["ToTerminalId"] = $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-id");
        transportRoute["FromCity"] = $("#fromTerminalsSearch").siblings(".selected-terminal").first().attr("data-city");
        transportRoute["ToCity"] = $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-city");
        transportRoute["FromState"] = $("#fromTerminalsSearch").siblings(".selected-terminal").first().attr("data-state");
        transportRoute["ToState"] = $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-state");
        transportRoute["FromAreaName"] = $("#fromTerminalsSearch").siblings(".selected-terminal").first().attr("data-areaName");
        transportRoute["ToAreaName"] = $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-areaName");
        $(".vehicleCategory").first().html("");

        if(siblingInput.attr("id") == "toTerminalsSearch"){
            DisableVehicleType();
            GetVehicleCategories(transportRoute);
        } else if(siblingInput.attr("id") == "fromTerminalsSearch"){
            transportRoute["ToTerminal"] = null;
            $("#toTerminalsSearch").siblings("input.terminals-search").first().val("");
            $("#toTerminalsSearch").siblings(".selected-terminal").first().text("");
            $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-id", "");
            $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-city", "");
            $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-state", "");
            $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-areaName", "");
            DisableVehicleType();
        }
    });

    $("#vehicleType").on('click', function(){
        $(this).siblings(".vehicleCategory").first().html("");
        if(transportRoute["FromTerminalId"] && transportRoute["ToTerminalId"]){
            vehicleCategoryTransportRoutes.forEach(vct => {
                var vCategory = $('<a href="#" class="dropdown-item vehicles" data-vctrId='+vct["Id"]+' data-vehicleCategoryId='+vct["CategoryId"]+' data-cost='+vct["Cost"]+' data-name="'+vct["Name"]+'" data-routeId='+vct["RouteId"]+'>'+vct["Name"]+ '&nbsp;&nbsp; ('+vct["Cost"]+')</a>');
                $(this).siblings(".vehicleCategory").first().append(vCategory);
            });
        }
    });

    var lastDateTimePickerEvent = null;

    $(".vehicleCategory").on("click", ".vehicles", function(e){
        e.preventDefault();
        e.stopPropagation();
        $("#vehicleCategory-name").text($(this).attr("data-name"));
        $("#vehicleCategory-cost").text($(this).attr("data-cost"));
        vctr["VehicleCategoryId"] = parseInt($(this).attr("data-vehicleCategoryId"));
        vctr["VehicleCategory"] = $(this).attr("data-name");
        vctr["Cost"] = parseInt($(this).attr("data-cost"));
        vctr["Id"] = parseInt($(this).attr("data-vctrId"));
        LoadBookingDates();
        DisableTimeSlots();
        
        if(lastDateTimePickerEvent != null){
            
            let bookingDay = ""+ lastDateTimePickerEvent.date["_d"].getDate() + "";
            bookingDay = bookingDay.length == 1 ? "0"+bookingDay : bookingDay;
            bookingDate = lastDateTimePickerEvent.date["_d"].getFullYear()+"-"+(lastDateTimePickerEvent.date["_d"].getMonth() + 1)+"-"+bookingDay;
            var res = travelDates.filter(obj => Object.values(obj).some(val => val.toString().includes(bookingDate)));
            if(res.length == 1){
                travelDateId = parseInt(res[0]["Id"]);
                pendingBooking["TravelDateId"] = travelDateId;
                console.log(pendingBooking["TravelDateId"] + " k");
                // if($("#TravelDate").val() != ""){
                //     EnableTimeSlots();
                //     console.log("Inside");
                // }
            }
        }
        EnableTravelDates();
        $("#vehicleType").click();
    });

    $("#datetimepicker4").on("change.datetimepicker", function(e) {
        lastDateTimePickerEvent = e; //test
        console.log("e.date:");
        console.log(e.date);
        let bookingDay = ""+ e.date["_d"].getDate() + "";
        bookingDay = bookingDay.length == 1 ? "0"+bookingDay : bookingDay;
        bookingDate = e.date["_d"].getFullYear()+"-"+(e.date["_d"].getMonth() + 1)+"-"+bookingDay;
        var res = travelDates.filter(obj => Object.values(obj).some(val => val.toString().includes(bookingDate)));
        if(res.length == 1){
            travelDateId = parseInt(res[0]["Id"]);
            pendingBooking["TravelDateId"] = travelDateId;
            console.log(pendingBooking["TravelDateId"] + " c");
            EnableTimeSlots();
        }
    });

    $("#confirm-details").on("click", function(){
        pendingBooking["CustomerPhone"] = $("#Phone").val();
        pendingBooking["CustomerEmail"] = $("#Email").val();
        booking["FullName"] = $("#FullName").val();
        pendingBooking["FullName"] = $("#FullName").val();
        $("#contact-information").modal("hide");
        var errorMessage = ValidateTicket(pendingBooking);
        if(errorMessage.length == 0){
            $("#confirm-booking").modal("show");
        } else{
            $("#info-alerts").html("");
            var top = 2;
            errorMessage.forEach( message => {
                var error = '<div class="alert alert-primary myAlert-top alert-server fade show pt-4 mt-5" style="top: '+top+'em"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+message+'</div>';
                $("#info-alerts").append(error);
                top = top+5;
            })
            myAlertTop();
        }
    });

    $("#confirm-booking").on("shown.bs.modal", function(){
        $("#confirm-fullname").text(booking["FullName"]);
        $("#confirm-phone").text(pendingBooking["CustomerPhone"]);
        $("#confirm-email").text(pendingBooking["CustomerEmail"]);
        $("#confirm-state-from").text(transportRoute["FromState"]);
        $("#confirm-state-to").text(transportRoute["ToState"]);
        $("#confirm-city-areaname-fro").text(transportRoute["FromCity"] + " => " + transportRoute["FromAreaName"]);
        $("#confirm-city-areaname-to").text(transportRoute["ToCity"] + " => " + transportRoute["ToAreaName"]);
        $("#confirm-travelDate").text($("#TravelDate").val() + " (" +$("#seat-timeslot").text() + ")");
        $("#confirm-vehicleCategory").text(vctr["VehicleCategory"]);
        $("#confirm-vehicleCost").text(vctr["Cost"]);
        $("#confirm-seatNo").text(pendingBooking["SeatNo"]);
    });
});

function DisableTimeSlots(){
    $("#timeSlot").siblings(".timeSlots").first().html("");
    $("#timeSlot").attr("disabled", true);
    vctrtId = null;
    pendingBooking["VCTRTid"] = null;
    pendingBooking["SeatNo"] = null;
}

function DisableTravelDates(){
    DisableTimeSlots();
    $("#datetimepicker4").attr("disabled", true);
    $("#TravelDate").attr("disabled", true);
    pendingBooking["TravelDateId"] = null;
}

function DisableVehicleType(){
    DisableTravelDates();
    $("#vehicleType").attr("disabled", true);
    vehicleCategoryTransportRoutes = [];
    vctr["TransportRouteId"] = null;
    vctr["VehicleCategoryId"] = null;
    vctr["VehicleCategory"] = null
    vctr["Cost"] = null;
    vctr["Id"] = null;
    $("#vehicleCategory-name").text("");
    $("#vehicleCategory-cost").text("");
}

function EnableTimeSlots(){
    if((pendingBooking["TravelDateId"]) != null && (parseInt(pendingBooking["TravelDateId"]) != NaN)){
        $("#timeSlot").removeAttr("disabled");
    } else {
        cuteAlert({
            type: "error",
            title: "Travel date error",
            message: "Please select a valid travel date first",
            buttonText: "Okay"
          })
    }
}

function EnableTravelDates(){
    if((vctr["Id"]) != null && (parseInt(vctr["Id"]) != NaN)){
        $("#TravelDate").removeAttr("disabled");
        if($("#TravelDate").val() != ""){
            console.log(pendingBooking["TravelDateId"] + "h");
            EnableTimeSlots();
            console.log("Inside");
        }
    } else {
        cuteAlert({
            type: "error",
            title: "Vehicle category error",
            message: "Please select a vehice category first",
            buttonText: "Okay"
          })
    }
}

function EnableVehicleType(){
    if(vehicleCategoryTransportRoutes.length > 0){
        $("#vehicleType").removeAttr("disabled");
    } else {
        cuteAlert({
            type: "error",
            title: "Destination error",
            message: "Please select a valid travel destination first",
            buttonText: "Okay"
          })
    }
}

function myAlertTop(){
    $("#info-alerts").show();
    $(".myAlert-top").show();
    setTimeout(function(){
      $(".myAlert-top").hide().fadeIn(300).fadeOut(300); 
    }, 6000);
    // $("#info-alerts").hide();
}
  
function myAlertBottom(){
    $("#info-alerts").show();
    //$('#info-alerts').css('display', 'block');
    setTimeout(function(){
      $("#info-alerts").hide(); 
    }, 5000);
}

function ValidateTicket(bookingTicket){
    var errorMessages = [];
    if(!bookingTicket["VCTRTid"]){
        errorMessages.push("Transport route, Vehicle category, or Time slot not set");
    }

    if(!bookingTicket["TravelDateId"]){
        errorMessages.push("Travel date not set");
    }

    if(!bookingTicket["FullName"]){
        errorMessages.push("Name not set");
    }

    if(!bookingTicket["SeatNo"]){
        errorMessages.push("Seat number not set");
    }

    if((!bookingTicket["CustomerPhone"] && bookingTicket["CustomerEmail"])){
        errorMessages.push("Phone or Email must be set");
    }
    return errorMessages;
}