import { WebGPUContext } from '../context/webGPUContext';

export type WebGPUObjectProps = {
  webGPUContext: WebGPUContext;
  label?: string;
};

export abstract class WebGPUObject {
  protected readonly webGPUContext: WebGPUContext;
  protected readonly label?: string;

  public constructor(props: WebGPUObjectProps) {
    this.webGPUContext = props.webGPUContext;
    this.label = props.label;
  }
}
