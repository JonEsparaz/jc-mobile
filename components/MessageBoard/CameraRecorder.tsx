import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Button } from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import JCComponent, { JCState } from '../JCComponent/JCComponent';

interface Props {

}
interface State extends JCState {
    permissions: Permissions.PermissionResponse,
    video: any,
    recording: boolean
    type: any
}
export default class MyCam extends JCComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.cam = React.createRef();
        this.state = {
            ...super.getInitialState(),
            permissions: null,
            type: Camera.Constants.Type.back
        }
        this.askForPermission()
    }
    async askForPermission() {
        const permissions: Permissions.PermissionResponse = await (await Permissions.askAsync(Permissions.CAMERA, Permissions.AUDIO_RECORDING))
        this.setState({ permissions: permissions })

    }
    cam: any
    saveVideo = async () => {
        const { video } = this.state;
        // const asset = await MediaLibrary.createAssetAsync(video.uri);
        //  if (asset) {
        //      this.setState({ video: null });
        //  }
    };

    StopRecord = async () => {
        this.setState({ recording: false }, () => {
            this.cam.stopRecording();
        });
    };

    StartRecord = async () => {
        if (this.cam) {
            this.setState({ recording: true }, async () => {
                const video = await this.cam.recordAsync();
                this.setState({ video });
            });
        }
    }
    //    const [permission, askPermission, getPermission] = Permissions.usePermissions(Permissions.CAMERA, {});
    toogleRecord = () => {
        const { recording } = this.state;

        if (recording) {
            this.StopRecord();
        } else {
            this.StartRecord();
        }
    };
    render() {
        if (!this.state.permissions || this.state.permissions.status !== 'granted') {
            return (
                <View>
                    <Text>Permission is not granted</Text>
                    <Button title="Grant permission" onPress={() => { this.askForPermission() }} />
                </View>
            );
        }

        return (
            <View style={{ height: 360, width: 360, flex: 1 }}>
                <Camera style={{ flex: 1 }} type={this.state.type} ref={cam => (this.cam = cam)}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'transparent',
                            flexDirection: 'row',
                        }}>
                        <TouchableOpacity
                            style={{
                                flex: 0.1,
                                alignSelf: 'flex-end',
                                alignItems: 'center',
                            }}
                            onPress={() => {
                                this.setState(
                                    {
                                        type: this.state.type === Camera.Constants.Type.back
                                            ? Camera.Constants.Type.front
                                            : Camera.Constants.Type.back
                                    });
                            }}>
                            <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={this.toogleRecord}
                        style={{
                            padding: 20,
                            width: "100%",
                            backgroundColor: this.state.recording ? "#ef4f84" : "#4fef97"
                        }}
                    >
                        <Text style={{ textAlign: "center" }}>
                            {this.state.recording ? "Stop" : "Record"}
                        </Text>
                    </TouchableOpacity>
                </Camera>
            </View >
        );
    }
}