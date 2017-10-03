# Copyright 2017 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


import webapp2, json, logging, urllib, requests, os
import requests_toolbelt.adapters.appengine
from google.appengine.api import urlfetch
# from poster.encode import multipart_encode, MultipartParam

class ShareVideo(webapp2.RequestHandler):
    def post(self):
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        code = self.request.get('code')
        clientSecret = os.environ['FB_CLIENT_SECRET']
        url = 'https://graph.facebook.com/oauth/access_token?client_id=1442525379177526&redirect_uri=https://teachablemachine.withgoogle.com/fb&code=' + code + '&client_secret=' + clientSecret
        try:
            result = urlfetch.fetch(url, validate_certificate=True)
            if result.status_code == 200:
                data = json.loads(result.content)
                accessToken = data['access_token']
                try:
                    requests_toolbelt.adapters.appengine.monkeypatch()
                    video = self.request.POST.get('video')
                    url = 'https://graph-video.facebook.com/v2.10/me/videos'
                    query = {
                        'access_token': accessToken
                    }
                    files = {
                        'source': (video.filename, video.file, video.type)
                    }
                    response = requests.post(url, data=query, files=files)
                    self.response.write(response.content)

                except urlfetch.Error:
                    logging.exception('Caught exception fetching url')
            else:
                self.response.status_int = result.status_code
        except urlfetch.Error:
            print '{"error": "error"}'


app = webapp2.WSGIApplication([
    ('/share-video', ShareVideo),
], debug=True)