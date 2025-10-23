from odoo import models, fields
from odoo.exceptions import UserError

class CameraCaptureWizard(models.TransientModel):
    _name = 'camera.capture.wizard'
    _description = 'Camera Capture Wizard'

    example_model_id = fields.Many2one('example.model', string='Example Model')
    image = fields.Image()

    def action_confirm(self):
        if not self.image:
            raise UserError("Please capture an image")
        self.example_model_id.image = self.image
        return {
            'type': 'ir.actions.act_window_close',
        }