# -*- coding: utf-8 -*-
{
    'name': "Camera Capture Widget",

    'summary': "This module provides a camera capture widget.",
    'description': """Capture images directly from your device camera with support for multiple camera devices and aspect ratios.""",

    'author': "Habib Mhamadi",
    'website': "https://github.com/habibmhamadi/hb_camera_capture",

    'category': 'Technical',
    'version': '18.0.1.0.0',
    'license': 'LGPL-3',

    # Uncomment the following lines and models.py to enable demo 
    'data': [
        # 'security/ir.model.access.csv',
        # 'views/views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'hb_camera_capture/static/src/**/*',
        ],
    },
    'images': ['static/description/banner.png'],
}
