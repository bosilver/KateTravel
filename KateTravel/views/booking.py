from flask import Blueprint, render_template, request
from ..python_excel.excel_reader import get_excel_data
from ..python_excel.excel_writer import write_booking_from
from flask import jsonify, json, Response

booking = Blueprint('booking', __name__)


@booking.route('/')
def activity_from():

    return render_template('/booking/activity.html')

@booking.route('/get/activity')
def get_activity():
    ac_list = get_excel_data('/Users/sherry/Documents/program-project/KateTravel/KateTravel/static/tmp.xlsx')
    return jsonify({"ac_list": ac_list})

@booking.route('/send/form', methods=['POST'])
def receive_booking_form():

    data = request.get_json()
    status = write_booking_from(data['detail'], data['activity_list'])
    return Response(json.dumps('Success.'), status=status, mimetype='application/json')
