from odoo import models, fields
from odoo.exceptions import UserError

# --------------------------------------------------------------------------------------------------
# Uncomment the following lines and manifest data to enable demo 
# --------------------------------------------------------------------------------------------------

# class ExampleModel(models.Model):
#     _name = 'example.model'
#     _description = 'Example Model'

#     name = fields.Char()
#     image = fields.Image()

#     def camera_capture_button(self):
#         return {
#             'type': 'ir.actions.act_window',
#             'name': 'Camera Capture',
#             'res_model': 'camera.capture.wizard',
#             'view_mode': 'form',
#             'target': 'new',
#             'context': {
#                 'default_example_model_id': self.id,
#             },
#         }


# class CameraCaptureWizard(models.TransientModel):
#     _name = 'camera.capture.wizard'
#     _description = 'Camera Capture Wizard'

#     example_model_id = fields.Many2one('example.model', string='Example Model')
#     image = fields.Image()

#     def action_confirm(self):
#         if not self.image:
#             raise UserError("Please capture an image")
#         self.example_model_id.image = self.image
#         return {
#             'type': 'ir.actions.act_window_close',
#         }