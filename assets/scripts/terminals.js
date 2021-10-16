var allTerminals = [];
var transportRoute = {"FromTerminalId" : null, "ToTerminalId" : null, "FromTerminal": null, "ToTerminal": null,
"FromState": "", "ToState": "", "FromCity": "", "ToCity": "", "FromAreaName": "", "ToAreaName": "", "Id": null};
var vctr = {"VehicleCategoryId": null, "TransportRouteId": null, "Cost": null, "Id":null, };
var vctrTime = {"VCTRId": null, "TimeSlot": null, "Id": null};
var vehicleCategoryTransportRoutes = [];
var bookingDate = null;
var booking = {
    "VCTRTid": null, "PaymentReference": "", "CustomerPhone": "", "CustomerEmail": "", "FullName": "", "TravelDateId": "", "SeatNo" : null
};

var pendingBooking = {
    "TravelDateId": null, "VCTRTid": null, "SeatNo": null, "CustomerPhone": null, "CustomerEmail": null, "FullName": null
};
$(document).ready(function(){
    // application should some how tie payment reference to particular booking before confirming payment
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

    function ValidateTicket(bookingTicket){
        var errorMessages = [];
        if(!bookingTicket["TransportRouteId"]){
            errorMessages.push("Transport route not set");
        }

        if(!bookingTicket["VehicleCategoryId"]){
            errorMessages.push("Vehicle category not set");
        }

        if(!bookingTicket["Phone"] && !bookingTicket["Email"]){
            errorMessages.push("Phone or Email must be set");
        }

        if(!$("#TravelDate").val()){
            errorMessages.push("Travel Date not set");
        } else {
            bookingTicket["TravelDate"] = $("#TravelDate").val();
        }
        
        return errorMessages;
    }

    function MakePayment(bookingTicket){
        var validated = ValidateTicket(bookingTicket);
        if(validated.length > 0){
            errorMessage.forEach( message => {
                //
            });
        }
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

    $(".terminals-search").on('input', function(){
        if($(this).attr("id") == "fromTerminalsSearch"){
            transportRoute["ToTerminal"] = null;
            $("#toTerminalsSearch").siblings("input.terminals-search").first().val("");
            $("#toTerminalsSearch").siblings(".selected-terminal").first().text("");
            $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-id", "");
            $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-city", "");
            $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-state", "");
            $("#toTerminalsSearch").siblings(".selected-terminal").first().attr("data-areaName", "");
        }
        LoadTerminals($(this).val(), $(this));
    });

    $(".personal-info").on('input', function(){
        booking[$(this).attr("id")] = $(this).val();
    })

    $("#TravelDate").on('change', function(){
        alert("testing");
    });

    $(".terminal-group").on('click', '.terminal-item', function(e){
        e.preventDefault();
        e.stopPropagation();
        $(this).siblings("input.terminals-search").first().val("");
        $(this).siblings(".selected-terminal").first().text($(this).text());
        $(this).siblings(".selected-terminal").first().attr("data-id", $(this).attr("data-id"));
        $(this).siblings(".selected-terminal").first().attr("data-city", $(this).attr("data-city"));
        $(this).siblings(".selected-terminal").first().attr("data-state", $(this).attr("data-state"));
        $(this).siblings(".selected-terminal").first().attr("data-areaName", $(this).attr("data-areaName"));
        $(this).siblings().not(".selected-terminal, .terminals-search").remove();
        $("#toTerminalsSearch").removeAttr('disabled');
        var siblingInput = $(this).siblings("input.terminals-search").first();
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
            GetVehicleCategories(transportRoute);
        } else{
            booking["VCTRTid"] = null;
            vctr["TransportRouteId"] = null;
            vctr["VehicleCategoryId"] = null;
            vctr["Cost"] = null;
            vctr["Id"] = null;
            $("#vctrId").val("");
        }
        $("#vehicleCategory-name").text("");
        $("#vehicleCategory-cost").text("");
        booking["VehicleCategoryId"] = null;
    });

    $("#vehicleType").on('click', function(){
        $(this).siblings(".vehicleCategory").first().html("");
        console.log("VehicleCategoryTransportRoutes: ");
        console.log(vehicleCategoryTransportRoutes);
        if(transportRoute["FromTerminalId"] && transportRoute["ToTerminalId"]){
            vehicleCategoryTransportRoutes.forEach(vc => {
                var vCategory = $('<a href="#" class="dropdown-item vehicles" data-vctrId='+vc["Id"]+' data-vehicleCategoryId='+vc["CategoryId"]+' data-cost='+vc["Cost"]+' data-name="'+vc["Name"]+'" data-routeId='+vc["RouteId"]+'>'+vc["Name"]+ '&nbsp;&nbsp; ('+vc["Cost"]+')</a>');
                $(this).siblings(".vehicleCategory").first().append(vCategory);
            });
        }
    });

    $(".vehicleCategory").on("click", ".vehicles", function(e){
        e.preventDefault();
        e.stopPropagation();
        $("#vehicleCategory-name").text($(this).attr("data-name"));
        $("#vehicleCategory-cost").text($(this).attr("data-cost"));
        vctr["VehicleCategoryId"] = parseInt($(this).attr("data-vehicleCategoryId"));
        vctr["VehicleCategory"] = $(this).attr("data-name");
        vctr["Cost"] = parseInt($(this).attr("data-cost"));
        vctr["Id"] = parseInt($(this).attr("data-vctrId"));
        $("#vctrId").val($(this).attr("data-vctrId"));
        $("#timeSlot").siblings(".timeSlots").first().html("");
        // clear timeslot dropdown
        $("#vehicleType").click();
    });

    $("#btn-makePayment").on("click", function(){
        var errorMessage = ValidateTicket(booking);
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
        $("#confirm-phone").text(booking["Phone"]);
        $("#confirm-email").text(booking["Email"]);
        $("#confirm-state-from").text(transportRoute["FromState"]);
        $("#confirm-state-to").text(transportRoute["ToState"]);
        $("#confirm-city-areaname-fro").text(transportRoute["FromCity"] + " => " + transportRoute["FromAreaName"]);
        $("#confirm-city-areaname-to").text(transportRoute["ToCity"] + " => " + transportRoute["ToAreaName"]);
        $("#confirm-travelDate").text(booking["TravelDate"]);
        $("#confirm-vehicleCategory").text(booking["VehicleCategory"]);
        $("#confirm-vehicleCost").text(booking["Cost"]);
    });

    
    
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
    
    function ShowSeatStatus(){
        $("#seat-selection").modal("show");
        $.ajax({
            url: "http://localhost:55932/api/vehicle/category?id="+booking["VehicleCategoryId"],
            method: "GET",
            success: function(response, status, xhr){
                var category = response["ResponseData"];
                var seats = category["Seats"];
                var rows = category["Rows"];
                var columns = category["Columns"]

                $("#seat-boundary").html("");

                for(let r = 0; r < rows; r++){
                    var row = '<div class="seat-row"></div>';
                    $("#seat-boundary").append(row);
                    for(var c = 0; c < columns; c++){
                        if(seats[r][c] == 0){
                            var noSeat = '<div class="seat-box no-seat"></div>';
                            $("#seat-boundary .seat-row").last().append(noSeat);
                        } else {
                            var seat = '<div class="seat-box booked-seat"><div class="seat-number">'+seats[r][c]+'</div></div>';
                            $("#seat-boundary .seat-row").last().append(seat);
                        }
                    }
                }
            }
        });
    }

    // $("#testBtn").on("click", function(){
    //     ShowSeatStatus();
    // });
});