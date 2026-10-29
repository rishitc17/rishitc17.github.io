"""Compatibility entry point for the complete, instance-preserving export."""
import os, runpy
runpy.run_path(os.path.join(os.path.dirname(__file__),'export_donut_complete.py'),run_name='__main__')
