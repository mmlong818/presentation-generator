'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, ArrowUp, ArrowDown, Check, X, Plus, Minus, Star, Heart, Zap,
  TrendingUp, TrendingDown, AlertTriangle, Info, Lightbulb, Target, Award,
  Users, User, MessageCircle, Mail, Phone, Calendar, Clock, MapPin,
  Globe, Briefcase, Building2, ShoppingCart, CreditCard, DollarSign,
  BarChart3, LineChart, PieChart, Activity, Database, Cloud, Cpu, Code,
  Smartphone, Monitor, Laptop, Camera, Image as ImageIcon, FileText,
  Folder, Lock, Unlock, Key, Shield, Eye, EyeOff, Search, Filter,
  Settings, Wrench, Hammer, Rocket, Flag, Bookmark, ThumbsUp, ThumbsDown,
  ChevronRight, ChevronDown, type LucideIcon,
} from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'

interface IconDef { name: string; cn: string; icon: LucideIcon }

const ICONS: IconDef[] = [
  { name: 'arrow-right', cn: '右箭头', icon: ArrowRight },
  { name: 'arrow-up', cn: '上箭头', icon: ArrowUp },
  { name: 'arrow-down', cn: '下箭头', icon: ArrowDown },
  { name: 'chevron-right', cn: '右尖角', icon: ChevronRight },
  { name: 'chevron-down', cn: '下尖角', icon: ChevronDown },
  { name: 'check', cn: '对号', icon: Check },
  { name: 'x', cn: '叉号', icon: X },
  { name: 'plus', cn: '加号', icon: Plus },
  { name: 'minus', cn: '减号', icon: Minus },
  { name: 'star', cn: '星', icon: Star },
  { name: 'heart', cn: '心', icon: Heart },
  { name: 'zap', cn: '闪电', icon: Zap },
  { name: 'trending-up', cn: '上升趋势', icon: TrendingUp },
  { name: 'trending-down', cn: '下降趋势', icon: TrendingDown },
  { name: 'alert', cn: '警告', icon: AlertTriangle },
  { name: 'info', cn: '信息', icon: Info },
  { name: 'lightbulb', cn: '灵感', icon: Lightbulb },
  { name: 'target', cn: '目标', icon: Target },
  { name: 'award', cn: '奖杯', icon: Award },
  { name: 'rocket', cn: '火箭', icon: Rocket },
  { name: 'flag', cn: '旗帜', icon: Flag },
  { name: 'bookmark', cn: '书签', icon: Bookmark },
  { name: 'thumbs-up', cn: '点赞', icon: ThumbsUp },
  { name: 'thumbs-down', cn: '反对', icon: ThumbsDown },
  { name: 'users', cn: '用户群', icon: Users },
  { name: 'user', cn: '单用户', icon: User },
  { name: 'message', cn: '消息', icon: MessageCircle },
  { name: 'mail', cn: '邮件', icon: Mail },
  { name: 'phone', cn: '电话', icon: Phone },
  { name: 'calendar', cn: '日历', icon: Calendar },
  { name: 'clock', cn: '时钟', icon: Clock },
  { name: 'map-pin', cn: '位置', icon: MapPin },
  { name: 'globe', cn: '地球', icon: Globe },
  { name: 'briefcase', cn: '公文包', icon: Briefcase },
  { name: 'building', cn: '公司', icon: Building2 },
  { name: 'cart', cn: '购物车', icon: ShoppingCart },
  { name: 'card', cn: '银行卡', icon: CreditCard },
  { name: 'dollar', cn: '美元', icon: DollarSign },
  { name: 'bar-chart', cn: '柱状图', icon: BarChart3 },
  { name: 'line-chart', cn: '折线图', icon: LineChart },
  { name: 'pie-chart', cn: '饼图', icon: PieChart },
  { name: 'activity', cn: '活动', icon: Activity },
  { name: 'database', cn: '数据库', icon: Database },
  { name: 'cloud', cn: '云', icon: Cloud },
  { name: 'cpu', cn: 'CPU', icon: Cpu },
  { name: 'code', cn: '代码', icon: Code },
  { name: 'smartphone', cn: '手机', icon: Smartphone },
  { name: 'monitor', cn: '显示器', icon: Monitor },
  { name: 'laptop', cn: '笔记本', icon: Laptop },
  { name: 'camera', cn: '相机', icon: Camera },
  { name: 'image', cn: '图片', icon: ImageIcon },
  { name: 'file', cn: '文件', icon: FileText },
  { name: 'folder', cn: '文件夹', icon: Folder },
  { name: 'lock', cn: '锁', icon: Lock },
  { name: 'unlock', cn: '开锁', icon: Unlock },
  { name: 'key', cn: '钥匙', icon: Key },
  { name: 'shield', cn: '盾牌', icon: Shield },
  { name: 'eye', cn: '眼睛', icon: Eye },
  { name: 'eye-off', cn: '隐藏', icon: EyeOff },
  { name: 'search', cn: '搜索', icon: Search },
  { name: 'filter', cn: '筛选', icon: Filter },
  { name: 'settings', cn: '设置', icon: Settings },
  { name: 'wrench', cn: '扳手', icon: Wrench },
  { name: 'hammer', cn: '锤子', icon: Hammer },
]

interface Props {
  open: boolean
  onClose: () => void
  /** Called with an SVG data URL ready for ImageElement.src */
  onPick: (svgDataUrl: string, name: string) => void
}

export default function IconPicker({ open, onClose, onPick }: Props) {
  const [q, setQ] = useState('')
  const items = useMemo(() => {
    const lower = q.toLowerCase()
    return ICONS.filter(i => !lower || i.name.includes(lower) || i.cn.includes(q))
  }, [q])
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onMouseDown={onClose}>
      <div className="bg-white rounded-lg w-[720px] max-h-[80vh] overflow-hidden flex flex-col" onMouseDown={(e) => e.stopPropagation()}>
        <header className="px-5 py-3 border-b border-stone-200 flex items-center justify-between">
          <h2 className="font-semibold">插入图标</h2>
          <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus
            placeholder="搜索（中文或英文）"
            className="px-3 py-1.5 text-sm border border-stone-300 rounded w-60" />
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-8 gap-2">
            {items.map(({ name, cn, icon: Icon }) => (
              <button key={name}
                onClick={() => {
                  const svg = renderToStaticMarkup(
                    <Icon size={64} strokeWidth={1.6} color="currentColor" />
                  )
                  const data = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
                  onPick(data, name)
                  onClose()
                }}
                title={`${cn} · ${name}`}
                className="aspect-square border border-stone-200 rounded hover:border-stone-900 hover:bg-stone-50 flex flex-col items-center justify-center gap-1 group">
                <Icon size={28} strokeWidth={1.5} className="text-stone-700 group-hover:text-stone-900" />
                <span className="text-[10px] text-stone-500 truncate w-full text-center px-1">{cn}</span>
              </button>
            ))}
            {items.length === 0 && (
              <div className="col-span-8 text-center text-stone-500 py-8 text-sm">无匹配图标</div>
            )}
          </div>
        </div>
        <footer className="px-5 py-3 border-t border-stone-200 text-xs text-stone-500 flex justify-between">
          <span>共 {ICONS.length} 个图标。选中后作为 SVG 图片元素插入。</span>
          <button onClick={onClose} className="text-stone-700 hover:underline">取消</button>
        </footer>
      </div>
    </div>
  )
}
