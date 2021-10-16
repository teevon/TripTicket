/*This script handles taking of name and contact information.
consumes pending booking api for pending booking creation
handles payment
creates booking
sends notification of booking to email and phone
*/
$(document).ready(function(){
    function payAndBook(seatBooking){
        $.ajax({
            url: "http://localhost:55932/api/booking/create/pendingbooking",
            method: "POST",
            data: {
                "SeatNo": pendingBooking["SeatNo"],
                "TravelDateId": pendingBooking["TravelDateId"],
                "VCTRTid": pendingBooking["VCTRTid"],
                "CustomerPhone": pendingBooking["CustomerPhone"],
                "CustomerEmail": pendingBooking["CustomerEmail"],
                "FullName": pendingBooking["FullName"]
            },
            success : function(response_data, status, xhr){
                console.log(response_data);
                $.ajax({
                    url: "http://localhost:55932/api/payment/reference",
                    method: "GET",
                    success: function(response, status, xhr){
                        //$("#confirm-booking").modal("hide");
                        console.log(response);
                        payWithPaystack(response["ResponseData"]);
                    }
                });
            }
        });
    }

    $("#make-payment").on("click", function(e){
        pendingBooking["CustomerPhone"] = $("#Phone").val();
        pendingBooking["CustomerEmail"] = $("#Email").val();
        booking["FullName"] = $("#FullName").val();
        $("#contact-information").modal("hide");
        $("#Phone").val("");
        $("#Email").val("");
        $("#FullName").val("");
        payAndBook(pendingBooking);
    });

    $("#paystack-pay").on("click", function(){
        $.ajax({
            url: "http://localhost:55932/api/payment/reference",
            method: "GET",
            success: function(response_data, status, xhr){
                $("#confirm-booking").modal("hide");
                payWithPaystack(response_data["ResponseData"]);
            }
        });
    });

    function payWithPaystack(paymentReference){
		let handler = PaystackPop.setup({
			key: 'pk_test_acedf4103ce109ffc0d05ab0f3cfd44767a3e5fb',
			email: pendingBooking["CustomerEmail"],
			amount: vctr["Cost"] * 100,
			ref: paymentReference,
			metadata: {
				custom_fields: [
				   {
				   	 display_name: "Mobile Number",
				   	 variable_name: "mobile_number",
				   	 value: pendingBooking["CustomerPhone"]
				   }
				]
			},
			callback: function(response) {
                $.ajax({
                    url: "http://localhost:55932/api/payment/store",
                    method: "POST",
                    data: {
                        "AmountPaid" : vctr["Cost"], "DayVCTRTId" : bookpendingBookinging["TransportRouteId"],
                        "PaymentReference" : response.reference, "CustomerName": booking["FullName"], "CustomerEmail": booking["Email"], "CustomerPhone": booking["Phone"]
                    },
                    success : function(response_data, status, xhr){
                        //self.location="verify.php?paymentReference="+paymentReference;
                        console.log("Response Data: ");
                        console.log(response_data);
                        console.log("Status: ");
                        console.log(status);
                        console.log("XHR: ");
                        console.log(xhr);
                    }
                })
			},
			onClose: function(){
                //self.location="verify.php?paymentReference="+paymentReference;
			}
		});
		handler.openIframe();
    }
});