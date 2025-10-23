/** @odoo-module */

import { registry } from '@web/core/registry';
import { ImageField } from '@web/views/fields/image/image_field';
import { useRef, useState, onWillUnmount, onMounted } from "@odoo/owl";

export class CameraCaptureField extends ImageField {
    static template = "hb_camera_capture.CameraCaptureField";

    setup() {
        super.setup();
        this.videoRef = useRef("videoElement");
        this.canvasRef = useRef("canvasElement");
        this.containerRef = useRef("videoContainer");
        
        this.aspectRatios = [
            { value: '1:1', label: '1:1 (Square)', width: 1, height: 1 },
            { value: '2:3', label: '2:3 (Portrait)', width: 2, height: 3 },
            { value: '3:4', label: '3:4 (Portrait)', width: 3, height: 4 },
            { value: '16:9', label: '16:9 (Widescreen)', width: 16, height: 9 },
            { value: '3:2', label: '3:2 (Landscape)', width: 3, height: 2 },
            { value: '4:3', label: '4:3 (Landscape)', width: 4, height: 3 },
        ];
        
        this.state = useState({
            isCameraActive: false,
            hasCapture: false,
            error: null,
            devices: [],
            selectedDeviceId: null,
            isLoadingDevices: true,
            aspectRatio: '1:1',
        });
        this.stream = null;

        onMounted(async () => {
            await this.loadDevices();
        });

        onWillUnmount(() => {
            this.stopCamera();
        });
    }

    async loadDevices() {
        try {
            // Request permission first to get device labels
            const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
            tempStream.getTracks().forEach(track => track.stop());

            // Now enumerate devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            this.state.devices = videoDevices.map(device => ({
                id: device.deviceId,
                label: device.label || `Camera ${videoDevices.indexOf(device) + 1}`
            }));

            // Select the last device by default (usually external USB camera)
            if (this.state.devices.length > 0) {
                this.state.selectedDeviceId = this.state.devices[this.state.devices.length - 1].id;
            }
            
            this.state.isLoadingDevices = false;
        } catch (err) {
            console.error("Error loading camera devices:", err);
            this.state.error = "Unable to access camera devices. Please ensure camera permissions are granted.";
            this.state.isLoadingDevices = false;
        }
    }

    async startCamera() {
        try {
            this.state.error = null;
            
            const constraints = {
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            // Use selected device if available
            if (this.state.selectedDeviceId) {
                constraints.video.deviceId = { exact: this.state.selectedDeviceId };
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.stream = stream;
            if (this.videoRef.el) {
                this.videoRef.el.srcObject = stream;
                this.state.isCameraActive = true;
                this.state.hasCapture = false;
                // Apply aspect ratio after video starts
                this.videoRef.el.onloadedmetadata = () => {
                    this.applyAspectRatio();
                };
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            this.state.error = "Unable to access camera. Please ensure camera permissions are granted.";
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.state.isCameraActive = false;
        }
    }

    onDeviceChange(ev) {
        this.state.selectedDeviceId = ev.target.value;
        // If camera is active, restart with new device
        if (this.state.isCameraActive) {
            this.stopCamera();
            this.startCamera();
        }
    }

    onAspectRatioChange(ev) {
        this.state.aspectRatio = ev.target.value;
        if (this.state.isCameraActive) {
            this.applyAspectRatio();
        }
    }

    applyAspectRatio() {
        const video = this.videoRef.el;
        if (!video) return;

        const ratio = this.aspectRatios.find(r => r.value === this.state.aspectRatio);
        if (!ratio) return;

        const targetRatio = ratio.width / ratio.height;
        const videoRatio = video.videoWidth / video.videoHeight;

        let width, height;
        
        if (targetRatio > videoRatio) {
            // Target is wider than video
            width = video.videoWidth;
            height = width / targetRatio;
        } else {
            // Target is taller than video
            height = video.videoHeight;
            width = height * targetRatio;
        }

        // Set video display size based on aspect ratio
        const maxWidth = 480;
        const displayWidth = maxWidth;
        const displayHeight = displayWidth / targetRatio;
        
        video.style.width = displayWidth + 'px';
        video.style.height = displayHeight + 'px';
        video.style.objectFit = 'cover';
    }

    captureImage() {
        const video = this.videoRef.el;
        const canvas = this.canvasRef.el;
        
        if (video && canvas) {
            const ratio = this.aspectRatios.find(r => r.value === this.state.aspectRatio);
            if (!ratio) return;

            const targetRatio = ratio.width / ratio.height;
            const videoRatio = video.videoWidth / video.videoHeight;

            let sourceWidth, sourceHeight, sourceX, sourceY;

            if (targetRatio > videoRatio) {
                // Target is wider - use full width, crop height
                sourceWidth = video.videoWidth;
                sourceHeight = sourceWidth / targetRatio;
                sourceX = 0;
                sourceY = (video.videoHeight - sourceHeight) / 2;
            } else {
                // Target is taller - use full height, crop width
                sourceHeight = video.videoHeight;
                sourceWidth = sourceHeight * targetRatio;
                sourceX = (video.videoWidth - sourceWidth) / 2;
                sourceY = 0;
            }

            // Set canvas size to maintain aspect ratio with good quality
            const outputWidth = 1200;
            const outputHeight = outputWidth / targetRatio;
            
            canvas.width = outputWidth;
            canvas.height = outputHeight;

            const context = canvas.getContext('2d');
            // Draw the cropped portion of the video to canvas
            context.drawImage(
                video,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, outputWidth, outputHeight
            );
            
            // Convert canvas to base64 image
            canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1];
                    this.props.record.update({ [this.props.name]: base64data });
                    this.state.hasCapture = true;
                    this.stopCamera();
                };
                reader.readAsDataURL(blob);
            }, 'image/jpeg', 0.95);
        }
    }

    retakeImage() {
        this.props.record.update({ [this.props.name]: false });
        this.state.hasCapture = false;
        this.startCamera();
    }

    get imageUrl() {
        const value = this.props.record.data[this.props.name];
        if (value) {
            return `data:image/jpeg;base64,${value}`;
        }
        return null;
    }

    get currentAspectRatio() {
        const ratio = this.aspectRatios.find(r => r.value === this.state.aspectRatio);
        return ratio ? ratio : this.aspectRatios[0];
    }
}

export const cameraCaptureField = {
    component: CameraCaptureField,
    supportedTypes: ["binary"],
    extractProps: ({ attrs, field }) => ({
        placeholder: attrs.placeholder,
        readonly: attrs.readonly,
    }),
};

registry.category("fields").add("camera_capture", cameraCaptureField);

