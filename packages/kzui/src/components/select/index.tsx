import  * as React from 'react';
import classNames from 'classnames';
import KZUIComponent, { baseDefaultProps } from '../base/component';
import Icon from '../icon/index';
import EventBlackHole from '../event-black-hole/index';
import Option from './Option';
import './style.less';
import { UiSizeType, OptionListType } from '../../../types/base';

interface onChangeArg {
  name: string
  value: string
  selectedText: string
  text: string
}

interface SelectProps {
  defaultText?: string //默认显示文案,
  name?: string //表单项名,
  value?: string //当前值,
  size?: UiSizeType //大小,
  options?: OptionListType //可选项,
  disabled?: boolean //是否禁用
  onChange?: (e: onChangeArg) => void
  onExpand?: () => void
  maxHeight?: number,
  hasMore?: boolean,
  onLoadMore?: () => void,
  popoverCls?: string,
  popoverStyle?: React.CSSProperties,
}

interface SelectStates {
  value?: string
  expand?: boolean
  selectedText?: string
}

class Select extends KZUIComponent<SelectProps, SelectStates> {
    wrp: HTMLElement;

    static defaultProps = {
      ...baseDefaultProps,
      defaultText: '请选择',
      value: null,
      name: '',
      disabled: false,
      options: [],
      onChange: null,
      maxHeight: null,
      hasMore: false,
      onLoadMore: null,
      onExpand: null,
      popoverCls: '',
      popoverStyle: {},
      size: '',
      initialExpand: false,
    }

    constructor(props) {
        super(props);
        this.autoBind('handleSelect', 'handleBlur', 'handleLoadMore', 'handleClick');
    }

    initStateFromProps(props) {
        let selectedText = props.defaultText;
        let value = props.value;
        const initialExpand = props.initialExpand;
        const selected = props.options.filter(item => (
            item.value === props.value
        ));
        if (selected.length > 0) {
            selectedText = selected[0].text;
            value = selected[0].value;
        }

        return {
            expand: initialExpand || false,
            value,
            selectedText,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { options, value } = nextProps
        const selected = options.filter(item => (item.value === value))
        let newSelectedText = this.state.selectedText
        if (selected.length > 0) {
            newSelectedText = selected[0].text;
        }
        this.setState({
            selectedText: newSelectedText,
            value
        })
    }

    handleClick() {
        if (this.props.disabled) {
            return;
        }
        const { expand } = this.state;
        this.wrp.focus();

        this.setState({
            expand: !expand,
        }, () => {
            if (!expand && this.props.onExpand) {
                this.props.onExpand();
            }
        });
    }

    handleBlur(e) {
        if (e.relatedTarget && this.wrp.contains(e.relatedTarget)) {
            e.preventDefault();
            return;
        }
        this.setState({
            expand: false,
        });
    }

    handleSelect(selected) {  // TODO value是否需要完全受控
        this.setState({
            selectedText: selected.text,
            value: selected.value,
            expand: false,
        });
        if (this.props.onChange) {
            this.props.onChange({
                name: this.props.name,
                value: selected.value,
                selectedText: selected.text,
                text: selected.text,
            });
        }
    }

    handleLoadMore() {
        const { onLoadMore } = this.props;
        if (onLoadMore === null) return;
        this.wrp.focus();
        onLoadMore();
    }

    render() {
        const clsPrefix = 'kui-select';
        const {
            className,
            style,
            disabled,
            size,
            popoverCls,
            popoverStyle,
            maxHeight,
        } = this.props;
        const { expand } = this.state;
        const cls = classNames(clsPrefix, {
            [`${clsPrefix}-expand`]: expand,
            [`${clsPrefix}-disabled`]: disabled,
            [`${clsPrefix}-${size}`]: !!size,
        }, className);

        const optionsPanelCls = classNames(popoverCls, `${clsPrefix}-options-panel`);

        let finalPopoverStyle = {
            ...popoverStyle,
        };

        if (maxHeight) {
            finalPopoverStyle = {
                ...popoverStyle,
                maxHeight: `${maxHeight}px`,
            };
        }

        return (
            <div
                ref={this.storeRef('wrp')}
                className={cls}
                style={style}
                role="button"
                tabIndex={0}
                onClick={this.handleClick}
                onBlur={this.handleBlur}
            >
                <div className={`${clsPrefix}-selected`}>
                    <div className={`${clsPrefix}-indicator`}>
                        <Icon type="nav-pull-down" />
                    </div>
                    <div className={`${clsPrefix}-selected-title`}>{this.state.selectedText}</div>
                </div>
                <div className={optionsPanelCls} style={{ ...finalPopoverStyle, display: expand ? 'block' : 'none' }}>
                    <EventBlackHole className={`${clsPrefix}-options`} captureEvents={['click']}>
                        {this.props.options.map((option, index) => (
                            <Option
                                key={`option-${index}`}
                                value={option.value}
                                selected={this.state.value === option.value}
                                onClick={this.handleSelect}
                                disabled={option.disabled}
                            >
                                {option.text}
                            </Option>
                        ))}
                        { this.props.options.length === 0 && (
                            <Option style={{ color: '#9b9b9b' }}>
                                没有内容
                            </Option>
                        )}
                        {
                            this.props.hasMore ?
                                <Option
                                    style={{ color: '#9b9b9b' }}
                                    value=""
                                    onClick={this.handleLoadMore}
                                >
                                    点击加载更多
                                </Option> : null
                        }
                    </EventBlackHole>
                </div>
            </div>
        );
    }
}

export default Select;

export {
    Option,
};
