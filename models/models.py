from odoo import models, fields

class ExampleModel(models.Model):
    _name = 'example.model'
    _description = 'Example Model'

    name = fields.Char()
    image = fields.Image()

    def camera_capture_button(self):
        return {
            'type': 'ir.actions.act_window',
            'name': 'Camera Capture',
            'res_model': 'camera.capture.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_example_model_id': self.id,
            },
        }