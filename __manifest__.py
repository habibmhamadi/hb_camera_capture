# -*- coding: utf-8 -*-
{
    'name': "Camera Capture",

    'summary': "This module provides a camera capture widget.",
    'description': """Capture images directly from your device camera with support for multiple camera devices and aspect ratios.""",

    'author': "Habib Mhamadi",
    'website': "https://www.habib08.com",

    'category': 'Technical',
    'version': '18.0.1.0.0',
    'license': 'LGPL-3',

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'views/views.xml',
        'wizards/camera_capture_wizard.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'hb_camera_capture/static/src/**/*',
        ],
    },
    'images': ['static/description/banner.png'],
}
