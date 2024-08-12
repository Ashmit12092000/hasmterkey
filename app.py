from flask import Flask, render_template, request, jsonify
import asyncio
import threading
from async_tasks import main, load_proxies

app = Flask(__name__)
app.secret_key = '2546988'

games = {
    1: {
        'name': 'Riding Extreme 3D',
        'appToken': 'd28721be-fd2d-4b45-869e-9f253b554e50',
        'promoId': '43e35910-c168-4634-ad4f-52fd764a843f',
    },
    2: {
        'name': 'Chain Cube 2048',
        'appToken': 'd1690a07-3780-4068-810f-9b5bbf2931b2',
        'promoId': 'b4170868-cef0-424f-8eb9-be0622e8e8e3',
    },
    3: {
        'name': 'My Clone Army',
        'appToken': '74ee0b5b-775e-4bee-974f-63e7f4d5bacb',
        'promoId': 'fe693b26-b342-4159-8808-15e3ff7f8767',
    },
    4: {
        'name': 'Train Miner',
        'appToken': '82647f43-3f87-402d-88dd-09a90025313f',
        'promoId': 'c4480ac7-e178-4973-8061-9ed5b2e17954',
    }
}

results = {}

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('t.html', games=games)

@app.route('/generate_keys', methods=['POST'])
def generate_keys():
    global results
    game_choice = int(request.form['game'])
    key_count = int(request.form['key_count'])
    proxy_file = request.files.get('proxy_file')
    
    proxy_path = None
    if proxy_file:
        proxy_path = f"./{proxy_file.filename}"
        proxy_file.save(proxy_path)

    def background_task(game_choice, key_count, proxy_path):
        proxy = asyncio.run(load_proxy(proxy_path)) if proxy_path else None
        keys, game_name = asyncio.run(main(game_choice, key_count, proxy))
        results['keys'] = keys
        results['game_name'] = game_name

    task_thread = threading.Thread(target=background_task, args=(game_choice, key_count, proxy_path))
    task_thread.start()
    task_thread.join()
    
    return jsonify(results)
